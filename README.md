# Fintalk challenge

A implementação neste repositório foi realizada usando Node, Typescript, Lambda e Terraform.

[Arquitetura para streaming para o RDS.](docs/dynamodb-streaming-rds.md)

## Endpoints

A seguir segue os endpoints de API disponibilizados pela aplicação.

### POST /transaction
Realiza a criação de uma transação.
```
curl -X POST https://api-gateway-url/transaction \
     -H "Content-Type: application/json" \
     -d '{
           "userId": "1",
           "amount": 100.50,
           "description": "Mercado"
         }'
```

### GET /transaction
Obtém os registros de transação.
Parâmetros:
- **userId**: filtro por usuário.
- **limit**: quantidade de registros a retornar.
- **lastEvaluatedKey**: ponteiro do ID do usuário para paginação.

```
curl https://api-gateway-url/transaction?userId=1234
```

### GET /balance
Calcula e retorna o saldo de um usuário no mês especificado.
Parâmetros:
- **userId**: filtro por usuário.
- **month**: mês no formato YYYY-MM

```
curl https://api-gateway-url/balance?userId=1234&month=1990-01
```

## Execução local

O projeto pode ser executado localmente usando a versão DynamoDB local disponibilizado pela AWS, que se encontra no ambiente docker compose.

1. Iniciar o container
```
docker compose up -d
```

2. Instalar AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

3. Definir credenciais fictícias:
```
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_REGION=us-east-1
```

2. Criar a tabela manualmente no DynamoDB local:
```
aws dynamodb create-table \
    --table-name Transactions \
    --billing-mode PAY_PER_REQUEST \
    --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S AttributeName=createdAt,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --endpoint-url http://localhost:8000 \
    --region us-east-1 \
    --global-secondary-indexes "[
        {
            \"IndexName\": \"UserIdIndex\",
            \"KeySchema\": [
                {\"AttributeName\": \"userId\", \"KeyType\": \"HASH\"},
                {\"AttributeName\": \"createdAt\", \"KeyType\": \"RANGE\"}
            ],
            \"Projection\": {\"ProjectionType\": \"ALL\"}
        }
    ]"
```

4. Buildar o projeto:
```
npx npm install
npx tsc
```

5. Setar variável para apontamento do DynamoDB para o local:
```
export DYNAMODB_ENDPOINT=http://localhost:8000
```

5. Usar a interface CLI para testar requisições.

Criar transação:
```
node dist/cli.js post transaction -d '{"userId":"12345", "amount":100, "description":"Lunch"}'
```

Obter transações:
```
node dist/cli.js get transaction -q "userId=12345,limit=5"
```

Obter saldo:
```
node dist/cli.js get balance -q "userId=12345,month=2025-03"
```

## Execução de testes
Os testes unitários podem ser executados com os comandos abaixo:

```
npx npm install
npx jest
```

## Deploy
O deploy da aplicação pode ser feito rodando o script `deploy.sh` presente na raiz do repositório.
```
chmod +x deploy.sh
./deploy.sh
```
O script irá buildar e empacotar a aplicação para publicação na Lambda, e em seguida será executado o provisionamento da estrutura usando Terraform.
