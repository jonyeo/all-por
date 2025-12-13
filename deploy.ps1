# 도서관 프로젝트 GitHub 배포 스크립트
$ErrorActionPreference = "Stop"

# 현재 스크립트 위치로 이동
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "도서관 폴더로 이동: $scriptPath"

# Git 저장소 확인
if (-not (Test-Path ".git")) {
    Write-Host "Git 저장소 초기화 중..."
    git init
}

# 원격 저장소 확인 및 설정
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "원격 저장소 추가 중..."
    git remote add origin https://github.com/jonyeo/all-por.git
}

# 변경사항 추가
Write-Host "변경사항 추가 중..."
git add .

# 커밋
Write-Host "커밋 중..."
git commit -m "Google 로그인 기능 추가 및 Firebase 인증 시스템 구현"

# 푸시
Write-Host "GitHub에 푸시 중..."
git branch -M main
git push -u origin main --force

Write-Host "완료!"

