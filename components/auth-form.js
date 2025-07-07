'use client'
import Link from 'next/link';
import { auth, signup } from '@/actions/auth-actions';
import { useFormState } from 'react-dom';

export default function AuthForm({mode}) {
  const [formState, formAction] = useFormState(auth.bind(null, mode), {});
  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState?.errors && (
        <ul id="errors">
          {
          Object.keys(formState.errors).map((error)=> <li key={error}>{formState.errors[error]}</li>)
          }
          </ul>
      )}
      <p>
        <button type="submit">
         {mode === 'login'? 'Login' : 'Create Account'}
        </button>
      </p>
      <p>
        {mode === 'login' && (<Link href="/?mode=signup">Create Account</Link>)}
        {mode === 'signup' && (<Link href="/?mode=login">Login An Existing Account</Link>)}
      </p>
    </form>
  );
}
