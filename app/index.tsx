import React, { useEffect } from 'react'
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session'
import { View, Text, TouchableOpacity } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { useRouter } from 'expo-router'

import { api } from '../src/lib/api'

import NlwLogo from '../src/assets/nlw-spacetime-logo.svg'

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint:
    'https://github.com/settings/connections/applications/e16dbc373054ed9756ff',
}

export default function App() {
  const router = useRouter()

  const [, response, githubSignIn] = useAuthRequest(
    {
      clientId: 'e16dbc373054ed9756ff',
      scopes: ['identity'],
      redirectUri: makeRedirectUri({
        scheme: 'nlw.spacetime',
      }),
    },
    discovery,
  )

  useEffect(() => {
    async function authenticate(authCode: string) {
      try {
        const { data } = await api.post('/register', { code: authCode })

        await SecureStore.setItemAsync('token', data.token)

        await SecureStore.setItemAsync('user', JSON.stringify(data.user))

        router.push('/memories')
      } catch (err) {
        console.log(JSON.stringify(err))
      }
    }

    if (response?.type === 'success') {
      const { code } = response.params

      authenticate(code)
    }
  }, [response, router])

  return (
    <View className="flex-1 items-center px-8 py-10">
      <View className="flex-1 items-center justify-center gap-6">
        <NlwLogo />

        <View className="space-y-2">
          <Text className="text-center font-title text-2xl leading-tight text-gray-50">
            Sua cápsula do tempo
          </Text>

          <Text className="text-center font-body text-base leading-relaxed text-gray-100">
            Colecione momentos marcantes da sua jornada e compartilhe (se
            quiser) com o mundo!
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-full bg-green-500 px-6 py-2"
          onPress={() => githubSignIn()}
        >
          <Text className="font-alt text-sm uppercase text-black">
            Cadastrar lembrança
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center font-body text-sm leading-relaxed text-gray-200">
        Feito com 💜 no NLW da Rocketseat
      </Text>
    </View>
  )
}
