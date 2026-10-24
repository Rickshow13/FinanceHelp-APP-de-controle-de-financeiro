<p align="center">
  <img src="assets/financehelp/icon.png" width="96" alt="Logo do FinanceHelp">
</p>

<h1 align="center">FinanceHelp</h1>

<p align="center">Cada real no seu lugar.</p>

App de finanças pessoais para registrar gastos e entradas, entender para onde o dinheiro vai e receber dicas a partir dos próprios números. Feito para quem quer largar a planilha.

## O que dá para fazer

- Criar conta com nome, e-mail e senha, e recuperar a senha com um código enviado por e-mail
- Registrar gastos e entradas em poucos toques, com o valor digitado no estilo de app de banco
- Editar e apagar movimentações, com confirmação em dois toques para evitar acidentes
- Ver o saldo do mês num cartão que fica dourado quando sobra dinheiro e coral quando falta
- Ver para onde o dinheiro foi, em ranking por categoria, e comparar entradas e saídas dos últimos 6 meses
- Receber dicas calculadas a partir dos próprios números, com base na regra 50-30-20
- Apagar a conta e todos os dados pelo próprio app, como pede a LGPD

## Tecnologias

- [React Native](https://reactnative.dev) com [Expo](https://expo.dev) (SDK 58) e Expo Router
- TypeScript
- [Supabase](https://supabase.com): autenticação e banco de dados PostgreSQL
- [Brevo](https://www.brevo.com) para o envio dos e-mails de recuperação de senha
- react-native-svg e expo-linear-gradient para o logo e o brilho metálico do cartão de saldo
- Fontes Big Shoulders e Schibsted Grotesk

## Segurança

- **Row Level Security (RLS)** no banco: cada usuário só consegue ver, criar, editar e apagar os próprios registros
- A exclusão de conta é feita por uma função `security definer` dentro do banco, então a chave de administrador nunca fica no app
- Nenhuma chave secreta no código: as configurações ficam num arquivo `.env`, que não vai para o repositório

A estrutura completa do banco, com as tabelas, as regras de segurança e a função de exclusão de conta, está em [`docs/banco.sql`](docs/banco.sql).

## Como rodar no seu computador

1. Clone o projeto e instale as dependências:
   ```
   git clone https://github.com/Rickshow13/meu-financeiro.git
   cd meu-financeiro
   npm install
   ```
2. Crie um projeto no [Supabase](https://supabase.com) e rode o arquivo `docs/banco.sql` no SQL Editor
3. Copie o arquivo `.env.example`, renomeie a cópia para `.env` e preencha com o endereço e a chave pública do seu projeto
4. Inicie o app:
   ```
   npx expo start
   ```
   Aperte `w` para abrir no navegador

## Organização das pastas

```
src/
├── app/            Telas (cada arquivo é uma rota do Expo Router)
│   ├── (tabs)/     As abas: Início, Gráficos, Dicas e Perfil
│   └── _layout.tsx O "porteiro": decide entre o login e as telas do app
├── components/     Peças reaproveitáveis (logo e gráfico de evolução)
└── lib/            Conexão com o Supabase, tema (cores e fontes) e categorias
docs/
└── banco.sql       Estrutura do banco de dados
```

## Autores

Desenvolvido por **Henrique Gava*

## Licença

Todos os direitos reservados. Veja o arquivo [LICENSE](LICENSE).