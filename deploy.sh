npm i
npm run build
cp -r ./node_modules dist/
cd dist
find . -name "*.zip" -type f -delete
zip -r lambda.zip .
cd ..
terraform init
terraform plan -input=false -out=./tfplan
terraform apply -input=false ./tfplan
