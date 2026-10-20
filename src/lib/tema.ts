// 🎨 GAVETA 1: as cores do app, cada uma com um nome fácil de lembrar
export const cores = {
  // Preto ônix: o fundo de todas as telas
  onix: '#050505',
  // Grafite: o fundo dos cartões, campos e botões secundários
  grafite: '#15130E',
  // Borda do grafite: as linhas finas em volta dos cartões e campos
  grafiteBorda: '#2A261C',
  // Ouro: a cor da marca e do dinheiro que ENTRA
  ouro: '#D9AE4A',
  // Ouro claro: o brilho do lingote
  ouroClaro: '#F7E09A',
  // Ouro escuro: a sombra do lingote
  ouroEscuro: '#8C6416',
  // Tinta do ouro: a cor das letras escritas EM CIMA do dourado
  ouroTinta: '#2B1F06',
  // Prata: textos de apoio (rótulos, datas, detalhes)
  prata: '#B4B1A8',
  // Marfim: o texto principal (um branco quentinho, que combina com o ouro)
  marfim: '#F5F0E4',
  // Coral: a cor do dinheiro que SAI (gastos)
  coral: '#FF7B6B',
  // Tinta do coral: a cor das letras escritas EM CIMA do coral
  coralTinta: '#2A0B06',
  // Apagado: textos de exemplo dentro dos campos vazios
  apagado: '#6F6B61',
// Fecha a gaveta das cores
};

// 🪙 GAVETA 2: a sequência de dourados que faz o brilho metálico (do mais claro ao mais escuro)
export const degradeOuro = [cores.ouroClaro, cores.ouro, '#B98A2A', cores.ouroEscuro] as const;

// 🔤 GAVETA 3: as letras do app
export const fontes = {
  // A letra do painel da bolsa, bem grossa: para o nome do app e os valores em reais
  marca: 'BigShoulders_800ExtraBold',
  // A letra do painel da bolsa, um pouco menos grossa: para os títulos das telas
  marcaTitulo: 'BigShoulders_700Bold',
  // A letra simples, grossura normal: para textos comuns
  texto: 'SchibstedGrotesk_400Regular',
  // A letra simples, grossura média: para rótulos
  textoMedio: 'SchibstedGrotesk_500Medium',
  // A letra simples, grossura forte: para destaques
  textoForte: 'SchibstedGrotesk_600SemiBold',
  // A letra simples, em negrito: para botões
  textoNegrito: 'SchibstedGrotesk_700Bold',
// Fecha a gaveta das letras
};