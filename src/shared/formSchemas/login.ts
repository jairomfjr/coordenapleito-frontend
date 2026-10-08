import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';

export const loginSchema = z.object({
  login: z.string().min(1, 'Informe o usuário ou CPF'),
  password: z.string().min(1, 'Informe a senha'),
});

export type loginFormProps = z.infer<typeof loginSchema>;

export const loginResolver: Resolver<loginFormProps> = zodResolver(loginSchema);

export const loginDefaultValue: loginFormProps = {
  login: '',
  password: '',
};
