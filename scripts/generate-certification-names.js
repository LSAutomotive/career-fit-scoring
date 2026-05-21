#!/usr/bin/env node
/**
 * Q-Net API(1회) + 공인민간(certificate_official.txt) + 추가 국가자격을 병합해
 * data/certification-names.json 을 생성합니다.
 *
 * 사용: node scripts/generate-certification-names.js
 *       node scripts/generate-certification-names.js --skip-fetch  (기존 JSON의 Q-Net 목록 유지, official/additional만 재병합)
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputPath = path.join(projectRoot, 'data', 'certification-names.json');
const envPath = path.join(projectRoot, '.env');
const officialPath = path.join(projectRoot, 'certificate_official.txt');
const additionalSourcePath = path.join(projectRoot, 'src', 'certificateParser.ts');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

function parseOfficialCertificates(fileContent) {
  const certificates = [];
  const lines = fileContent.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = line.split('\t');
    if (columns.length < 6) continue;
    let certName = (columns[4] || '').trim();
    let gradeName = (columns[5] || '').trim();
    if (gradeName.startsWith('"') && gradeName.endsWith('"')) gradeName = gradeName.slice(1, -1);
    if (certName.startsWith('"') && certName.endsWith('"')) certName = certName.slice(1, -1);
    if (!certName) continue;
    if (!gradeName || gradeName === '등급없음' || gradeName === '없음') {
      certificates.push(certName);
    } else if (gradeName === '단일등급') {
      certificates.push(`${certName} 단일등급`);
    } else {
      const grades = gradeName.split(',').map((g) => g.trim()).filter(Boolean);
      if (grades.length > 0) {
        grades.forEach((grade) => certificates.push(`${certName} ${grade}`));
      } else {
        certificates.push(certName);
      }
    }
  }
  return certificates;
}

function loadAdditionalNationalCertificates() {
  if (!fs.existsSync(additionalSourcePath)) return [];
  const content = fs.readFileSync(additionalSourcePath, 'utf8');
  const match = content.match(/export const ADDITIONAL_NATIONAL_CERTIFICATES = `\s*\n([\s\S]*?)`\s*\.trim\(\)/);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function fetchQNetCertificationsOnce(apiKey) {
  return new Promise((resolve, reject) => {
    const url = `http://openapi.q-net.or.kr/api/service/rest/InquiryListNationalQualifcationSVC/getList?ServiceKey=${apiKey}`;
    http
      .get(url, { timeout: 90000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const errorMatch = data.match(/<resultCode>(\d+)<\/resultCode>/);
          if (errorMatch && errorMatch[1] !== '00') {
            const errorMsgMatch = data.match(/<resultMsg>([^<]*)<\/resultMsg>/);
            reject(new Error(`Q-Net API 오류 (코드: ${errorMatch[1]}): ${errorMsgMatch?.[1] || 'Unknown'}`));
            return;
          }
          const certifications = [];
          const matches = data.match(/<jmfldnm[^>]*>([^<]*)<\/jmfldnm>/g) || [];
          matches.forEach((m) => {
            const name = m.replace(/<\/?jmfldnm[^>]*>/g, '').trim();
            if (name) certifications.push(name);
          });
          if (certifications.length === 0) {
            reject(new Error('Q-Net API 응답에 자격증 이름이 없습니다.'));
            return;
          }
          resolve(certifications);
        });
      })
      .on('error', reject);
  });
}

async function fetchQNetCertifications(apiKey, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchQNetCertificationsOnce(apiKey);
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        console.warn(`[generate] Q-Net fetch 실패 (${attempt}/${retries}):`, err.message || err);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  throw lastError;
}

function mergeUnique(names) {
  const seen = new Set();
  const result = [];
  for (const name of names) {
    const trimmed = (name || '').trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result.sort((a, b) => a.localeCompare(b, 'ko'));
}

async function main() {
  const skipFetch = process.argv.includes('--skip-fetch');
  loadEnv(envPath);

  let qnetCerts = [];
  if (skipFetch && fs.existsSync(outputPath)) {
    const existing = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    qnetCerts = existing.qnetCertifications || [];
    if (qnetCerts.length === 0) {
      console.error('[generate] --skip-fetch: 기존 JSON에 qnetCertifications가 없습니다. API fetch 없이 재생성할 수 없습니다.');
      process.exit(1);
    }
  } else {
    const apiKey = process.env.QNET_API_KEY;
    if (!apiKey) {
      console.error('[generate] QNET_API_KEY가 .env에 없습니다. API fetch를 건너뛰려면 --skip-fetch 와 기존 JSON이 필요합니다.');
      process.exit(1);
    }
    qnetCerts = await fetchQNetCertifications(apiKey);
    console.log('[generate] Q-Net API:', qnetCerts.length, '건');
  }

  let officialCerts = [];
  if (fs.existsSync(officialPath)) {
    officialCerts = parseOfficialCertificates(fs.readFileSync(officialPath, 'utf8'));
    console.log('[generate] certificate_official.txt:', officialCerts.length, '건');
  } else {
    console.warn('[generate] certificate_official.txt 없음 — 건너뜀');
  }

  const additionalCerts = loadAdditionalNationalCertificates();
  console.log('[generate] 추가 국가자격:', additionalCerts.length, '건');

  const certifications = mergeUnique([...qnetCerts, ...officialCerts, ...additionalCerts]);
  const payload = {
    version: 1,
    lastUpdated: new Date().toISOString().slice(0, 10),
    count: certifications.length,
    sources: {
      qnet: qnetCerts.length,
      official: officialCerts.length,
      additional: additionalCerts.length,
    },
    certifications,
    qnetCertifications: qnetCerts,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log('[generate] 저장:', outputPath, '— 총', certifications.length, '건');
}

main().catch((err) => {
  console.error('[generate] 실패:', err.message || err);
  process.exit(1);
});
