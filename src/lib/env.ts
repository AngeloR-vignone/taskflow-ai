function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const publicEnv = {
  get supabaseUrl(): string {
    return required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseAnonKey(): string {
    return required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  },
};

export const serverEnv = {
  get openaiApiKey(): string {
    return required('OPENAI_API_KEY', process.env.OPENAI_API_KEY);
  },
  get openaiModel(): string {
    return process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  },
};
