// Importa as abas do expo-router
import { Tabs } from 'expo-router';
// Importa a caixa de ícones
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa as cores e as letras do guarda-roupa
import { cores, fontes } from '../../lib/tema';

// Cria a moldura da área VIP (as abas)
export default function LayoutAbas() {
  // Devolve as abas
  return (
    // As abas, com as configurações que valem para todas
    <Tabs
      // Configurações de todas as abas
      screenOptions={{
        // Esconde a barra de título de cada tela
        headerShown: false,
        // Fundo de todas as telas: preto ônix
        sceneStyle: { backgroundColor: cores.onix },
        // A barra de abas: fundo preto e uma linha fina em cima
        tabBarStyle: { backgroundColor: cores.onix, borderTopColor: cores.grafiteBorda },
        // Cor da aba escolhida: dourada
        tabBarActiveTintColor: cores.ouro,
        // Cor das outras abas: prata
        tabBarInactiveTintColor: cores.prata,
        // Letra dos nomes das abas
        tabBarLabelStyle: { fontFamily: fontes.textoMedio, fontSize: 12 },
      // Fecha as configurações
      }}
    // Fecha a abertura das abas
    >
      {/* Aba "Início": ícone de casa (cheio se escolhida, só contorno se não) */}
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color as string} /> }} />      {/* Aba "Gráficos": ícone de barras (cheio se escolhida, só contorno se não) */}
      <Tabs.Screen name="graficos" options={{ title: 'Gráficos', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={22} color={color as string} /> }} />      {/* A tela de exemplo do Expo: continua escondida (sem endereço) */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    {/* Fecha as abas */}
    </Tabs>
  // Fecha o return
  );
// Fecha a moldura
}