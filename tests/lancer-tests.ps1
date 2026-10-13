# Lance la suite de tests (voir tests/lancer.js). Il faut Node.js et Google Chrome.
node (Join-Path $PSScriptRoot 'lancer.js') @args
exit $LASTEXITCODE
