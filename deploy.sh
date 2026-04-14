#!/bin/bash

set -e  # detiene si hay error

echo "🚀 Deploy iniciado..."

git checkout frontend
npm run build

cp -r out ../out-temp

git checkout Deploy
rm -rf *
cp -r ../out-temp/* .

rm -rf ../out-temp

git add .
git commit -m "deploy automático" || echo "Sin cambios para commit"
git push

git checkout frontend

echo "✅ Deploy completado"
