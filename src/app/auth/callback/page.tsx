"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        addDebug('🚀 ===== AUTH CALLBACK STARTED =====');
        
        // Get the code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        
        if (error) {
          addDebug(`❌ OAuth Error: ${error}`);
          localStorage.removeItem('pendingUserRole');
          router.push(`/register?error=${error}`);
          return;
        }
        
        if (!code) {
          addDebug('⚠️ No code, checking for existing session...');
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            addDebug('✅ Found existing session');
            await processUserSession(session.user);
            return;
          }
          
          addDebug('❌ No code and no session');
          localStorage.removeItem('pendingUserRole');
          router.push('/register');
          return;
        }

        addDebug('🔄 Exchanging code for session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError || !sessionData.session?.user) {
          addDebug(`❌ Session exchange failed`);
          localStorage.removeItem('pendingUserRole');
          router.push('/register?error=auth_failed');
          return;
        }

        addDebug('✅ Session created successfully');
        await processUserSession(sessionData.session.user);
        
      } catch (error) {
        addDebug(`💥 Error: ${error}`);
        localStorage.removeItem('pendingUserRole');
        router.push('/register?error=auth_failed');
      }
    };

    const processUserSession = async (user: any) => {
      addDebug(`👤 User: ${user.email}`);
      addDebug(`🔍 Current metadata role: ${user.user_metadata?.role || 'NOT SET'}`);

      const pendingRole = localStorage.getItem('pendingUserRole') as 'student' | 'mentor' | null;
      addDebug(`🎭 Pending Role from localStorage: ${pendingRole || 'NOT FOUND'}`);
      
      if (!pendingRole) {
        addDebug('❌ No role found');
        await supabase.auth.signOut();
        router.push('/register?error=no_role');
        return;
      }

      const correctTable = pendingRole === 'mentor' ? 'mentor_profiles' : 'profiles';
      const wrongTable = pendingRole === 'mentor' ? 'profiles' : 'mentor_profiles';

      addDebug(`📊 Correct table: ${correctTable}`);
      addDebug(`⚠️  Wrong table: ${wrongTable}`);

      // Check if user already exists in wrong table
      addDebug(`🔍 Checking ${wrongTable} for conflicts...`);
      const { data: wrongProfile } = await supabase
        .from(wrongTable)
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (wrongProfile) {
        addDebug(`❌ CONFLICT! User exists in ${wrongTable}`);
        addDebug(`📄 Wrong profile data: ${JSON.stringify(wrongProfile)}`);
        setShowDebug(true);
        localStorage.removeItem('pendingUserRole');
        await supabase.auth.signOut();
        router.push(`/register?error=wrong_role&expected=${pendingRole}`);
        return;
      }

      addDebug(`✅ No conflict in ${wrongTable}`);

      // Check if profile exists in correct table
      addDebug(`🔍 Checking ${correctTable}...`);
      const { data: correctProfile } = await supabase
        .from(correctTable)
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (correctProfile) {
        addDebug(`✅ Profile already exists in ${correctTable}`);
        addDebug(`📄 Profile: ${JSON.stringify(correctProfile)}`);
      } else {
        // Profile doesn't exist - need to create it manually for Google OAuth
        addDebug(`⚠️  Profile NOT found in ${correctTable}`);
        addDebug(`🔧 Creating profile manually for Google OAuth user...`);
        
        const profileData = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email?.split('@')[0] || 
                    'User',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || 
                     user.user_metadata?.picture || 
                     null,
        };

        addDebug(`📝 Profile data: ${JSON.stringify(profileData)}`);
        addDebug(`💾 Inserting into ${correctTable}...`);

        const { data: insertedProfile, error: insertError } = await supabase
          .from(correctTable)
          .insert(profileData)
          .select();
        
        if (insertError) {
          addDebug(`❌ INSERT FAILED!`);
          addDebug(`❌ Error: ${insertError.message}`);
          addDebug(`❌ Code: ${insertError.code}`);
          addDebug(`❌ Details: ${insertError.details}`);
          
          if (insertError.code === '42501') {
            addDebug(`🔒 RLS POLICY ERROR!`);
          }
          
          setShowDebug(true);
          localStorage.removeItem('pendingUserRole');
          await supabase.auth.signOut();
          router.push('/register?error=profile_creation_failed');
          return;
        }

        addDebug(`✅ Profile created successfully in ${correctTable}!`);
        addDebug(`📄 Created profile: ${JSON.stringify(insertedProfile)}`);
      }

      // Update user metadata with role (for future reference)
      addDebug(`🔄 Updating user metadata with role...`);
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: pendingRole }
      });

      if (updateError) {
        addDebug(`⚠️  Metadata update warning: ${updateError.message}`);
      } else {
        addDebug(`✅ Metadata updated with role: ${pendingRole}`);
      }

      localStorage.removeItem('pendingUserRole');
      const redirectUrl = pendingRole === 'mentor' ? '/mentor-dashboard' : '/';
      addDebug(`🚀 Redirecting to: ${redirectUrl}`);
      addDebug(`🎉 ===== SUCCESS =====`);
      
      setTimeout(() => {
        router.push(redirectUrl);
      }, 1500);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Completing Sign In...</h2>
            <p className="text-gray-600">Please wait while we set up your account</p>
          </div>
          
          {showDebug && (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">🔍 Debug Log</h3>
                <button
                  onClick={() => setShowDebug(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Hide
                </button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {debugInfo.map((info, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs font-mono mb-1 ${
                      info.includes('❌') || info.includes('FAILED') || info.includes('CONFLICT') ? 'text-red-400' :
                      info.includes('✅') || info.includes('SUCCESS') ? 'text-green-400' :
                      info.includes('⚠️') ? 'text-yellow-400' :
                      info.includes('🎉') ? 'text-blue-400' :
                      'text-gray-300'
                    }`}
                  >
                    {info}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">
                💡 This debug log shows the complete OAuth flow
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}