// Importa as abas do expo-router
import { Tabs } from 'expo-router';
// Importa as cores do guarda-roupa
import { cores } from '../../lib/tema';

// Cria a moldura da área VIP (as abas)
export default function LayoutAbas() {
  // Devolve as abas
  return (
    // As abas, com as configurações que valem para todas elas
    <Tabs
      // Configurações de todas as abas
      screenOptions={{
        // Esconde a barra de título de cada tela
        headerShown: false,
        // Esconde a barra de abas por enquanto (ela volta no Passo 5, com a aba Gráficos)
        tabBarStyle: { display: 'none' },
        // Fundo de todas as telas: preto ônix
        sceneStyle: { backgroundColor: cores.onix },
      // Fecha as configurações
      }}
    // Fecha a abertura das abas
    >
      {/* A tela inicial */}
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      {/* A tela de exemplo do Expo: escondida (href: null quer dizer "sem endereço") */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    {/* Fecha as abas */}
    </Tabs>
  // Fecha o return
  );
// Fecha a moldura
}