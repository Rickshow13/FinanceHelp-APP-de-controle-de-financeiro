// Carrega o "tradutor de endereços" que o Supabase precisa para funcionar no celular
import 'react-native-url-polyfill/auto';
// Importa a "gavetinha" do celular onde vamos guardar o login da pessoa
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importa a ferramenta que cria a conexão com o cofre
import { createClient } from '@supabase/supabase-js';
// Importa o "Platform", que diz se o app está rodando no celular ou no navegador
import { Platform } from 'react-native';

// Pega o endereço do cofre lá do arquivo secreto .env
const enderecoDoCofre = process.env.EXPO_PUBLIC_SUPABASE_URL!;
// Pega a chave do cofre lá do arquivo secreto .env
const chaveDoCofre = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// Cria a conexão com o cofre e "exporta", para as outras telas poderem usar
export const supabase = createClient(enderecoDoCofre, chaveDoCofre, {
  // Configurações do login
  auth: {
    // No celular, usa a gavetinha. No navegador, usa a gaveta própria do navegador
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    // Renova o login sozinho, para a pessoa não ser "expulsa" do app do nada
    autoRefreshToken: true,
    // Lembra do login mesmo depois de fechar o app
    persistSession: true,
    // Desliga uma função que só serve para sites (o nosso é um app)
    detectSessionInUrl: false,
  // Fecha as configurações do login
  },
// Fecha a criação da conexão
});