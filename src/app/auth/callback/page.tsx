"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing Sign In...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');

        if (error) {
          console.error('OAuth Error:', error);
          localStorage.removeItem('pendingUserRole');
          router.push(`/register?error=${error}`);
          return;
        }

        // No code? Check for existing session
        if (!code) {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            await processUserSession(session.user);
            return;
          }

          localStorage.removeItem('pendingUserRole');
          router.push('/register');
          return;
        }

        setStatus('Creating your session...');

        // Exchange the OAuth code for a Supabase session
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError || !sessionData.session?.user) {
          console.error('Session exchange failed:', sessionError);
          localStorage.removeItem('pendingUserRole');
          router.push('/register?error=auth_failed');
          return;
        }

        setStatus('Setting up your account...');
        await processUserSession(sessionData.session.user);

      } catch (error) {
        console.error('Auth callback error:', error);
        localStorage.removeItem('pendingUserRole');
        router.push('/register?error=auth_failed');
      }
    };

    interface AuthUser {
      id: string;
      email?: string | null;
    }

    const processUserSession = async (user: AuthUser) => {
      // Read the role that was set before the OAuth redirect
      const pendingRole = localStorage.getItem('pendingUserRole') as
        | 'student'
        | 'mentor'
        | null;

      // If no role was stored (returning user, or localStorage was cleared),
      // check which table the user already exists in instead of signing out.
      if (!pendingRole) {
        // Check if user exists in profiles (student)
        const { data: studentProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (studentProfile) {
          // Returning student — redirect to home
          localStorage.removeItem('pendingUserRole');
          router.push('/');
          return;
        }

        // Check if user exists in mentor_profiles
        const { data: mentorProfile } = await supabase
          .from('mentor_profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (mentorProfile) {
          // Returning mentor — redirect to mentor dashboard
          localStorage.removeItem('pendingUserRole');
          router.push('/mentor-dashboard');
          return;
        }

        // Brand new user with no role stored — default to student
        // (This handles edge cases like cleared localStorage)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          // Wait for DB trigger to create profile, then retry
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        localStorage.removeItem('pendingUserRole');
        router.push('/');
        return;
      }

      // Role was stored — validate and route accordingly
      const correctTable = pendingRole === 'mentor' ? 'mentor_profiles' : 'profiles';
      const wrongTable = pendingRole === 'mentor' ? 'profiles' : 'mentor_profiles';

      // Check if user already exists in the wrong table (role conflict)
      const { data: wrongProfile } = await supabase
        .from(wrongTable)
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (wrongProfile) {
        localStorage.removeItem('pendingUserRole');
        await supabase.auth.signOut();
        router.push(`/register?error=wrong_role&expected=${pendingRole}`);
        return;
      }

      // Check if profile exists in the correct table
      const { data: correctProfile } = await supabase
        .from(correctTable)
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!correctProfile) {
        // Wait for DB trigger to create it, then retry once
        await new Promise(resolve => setTimeout(resolve, 1500));

        const { data: retryProfile } = await supabase
          .from(correctTable)
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!retryProfile) {
          console.error('Profile not created by DB trigger');
          localStorage.removeItem('pendingUserRole');
          await supabase.auth.signOut();
          router.push('/register?error=profile_creation_failed');
          return;
        }
      }

      // Success — clean up and redirect
      localStorage.removeItem('pendingUserRole');
      const redirectUrl = pendingRole === 'mentor' ? '/mentor-dashboard' : '/';
      router.push(redirectUrl);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-[#eaf2ff] to-[#cddfff] p-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#005de6] mb-4"></div>
            <h2 className="text-2xl font-bold text-[#005de6] mb-2">
              {status}
            </h2>
            <p className="text-gray-600">Please wait while we set up your account</p>
          </div>
        </div>
      </div>
    </div>
  );
}