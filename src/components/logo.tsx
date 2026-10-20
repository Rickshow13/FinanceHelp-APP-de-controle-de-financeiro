// Importa as peças de desenho do "lápis" SVG
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// Cria o logo do FinanceHelp. Quem usar pode escolher o tamanho (se não escolher, fica 96)
export default function Logo({ tamanho = 96 }: { tamanho?: number }) {
  // Devolve o desenho
  return (
    // A "folha" do desenho: 96 x 96 quadradinhos, mostrada no tamanho escolhido
    <Svg width={tamanho} height={tamanho} viewBox="0 0 96 96">
      {/* A paleta: os degradês que as peças vão usar */}
      <Defs>
        {/* Degradê "ouro": na diagonal, do dourado claro ao escuro */}
        <LinearGradient id="ouro" x1="0" y1="0" x2="1" y2="1">
          {/* Começo: dourado claro */}
          <Stop offset="0" stopColor="#F7E09A" />
          {/* Meio: dourado */}
          <Stop offset="0.5" stopColor="#D9AE4A" />
          {/* Fim: dourado escuro */}
          <Stop offset="1" stopColor="#8C6416" />
        {/* Fecha o degradê ouro */}
        </LinearGradient>
        {/* Degradê "prata": de cima para baixo, do prata claro ao escuro */}
        <LinearGradient id="prata" x1="0" y1="0" x2="0" y2="1">
          {/* Começo: prata claro */}
          <Stop offset="0" stopColor="#ECEAE4" />
          {/* Fim: prata escuro */}
          <Stop offset="1" stopColor="#8F8C84" />
        {/* Fecha o degradê prata */}
        </LinearGradient>
      {/* Fecha a paleta */}
      </Defs>
      {/* A moldura: um quadrado de pontas arredondadas, só com o contorno dourado */}
      <Rect x="6" y="6" width="84" height="84" rx="24" fill="none" stroke="url(#ouro)" strokeWidth="5" />
      {/* Barrinha 1 (a mais baixa), prateada */}
      <Rect x="24" y="54" width="9" height="20" rx="2" fill="url(#prata)" />
      {/* Barrinha 2 (média), prateada */}
      <Rect x="38" y="46" width="9" height="28" rx="2" fill="url(#prata)" />
      {/* Barrinha 3 (a mais alta), dourada */}
      <Rect x="52" y="38" width="9" height="36" rx="2" fill="url(#ouro)" />
      {/* A linha em zigue-zague subindo: liga os pontos (22,46) → (44,32) → (54,38) → (72,24) */}
      <Path d="M22 46 L44 32 L54 38 L72 24" fill="none" stroke="url(#ouro)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* A ponta da seta: um "L" virado no canto de cima */}
      <Path d="M62 22 L74 22 L74 34" fill="none" stroke="url(#ouro)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Fecha a folha */}
    </Svg>
  // Fecha o return
  );
// Fecha o logo
}