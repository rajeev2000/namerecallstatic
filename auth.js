// auth.js
// 1) Put your Supabase anon/public key below (do NOT use service_role key here)
const SUPABASE_URL = 'https://zngivcljmzczywrricuz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZ2l2Y2xqbXpjenl3cnJpY3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjg3ODIsImV4cCI6MjA3MDUwNDc4Mn0.LLmMGJkg1LRnttdN8bCyUTTzCZS-U-DxXX3mG9m_2l8'; // <-- paste your anon key here

// Wait for DOM so element lookups succeed
document.addEventListener('DOMContentLoaded', () => {
  // Basic guard: make sure the Supabase library loaded
  if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.error('Supabase library not found. Make sure the CDN script is included BEFORE auth.js.');
    return;
  }

  // Create the client using a different variable name (avoid shadowing the global)
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  // Expose supabaseClient globally for other scripts (like React app in Namerecall.html)
  window.supabaseClient = supabaseClient;

  // Find the login button
  const loginButton = document.getElementById('login-button');
  if (!loginButton) {
    console.error("Login button with id 'login-button' not found.");
    // Do not return here as auth.js might be loaded on Namerecall.html which doesn't have this button.
    // It's still important to initialize window.supabaseClient.
  } else {
    // Helper: compute redirectTo that points to game.html in the SAME folder
    function redirectToGameInSameFolder() {
      // current page URL without filename (e.g. https://site.com/folder/index.html -> https://site.com/folder)
      const url = window.location.href;
      const base = url.substring(0, url.lastIndexOf('/'));
      // join base and game.html
      return base + '/Namerecall.html';
    }

    // Click handler for Google OAuth sign-in
    loginButton.addEventListener('click', async (ev) => {
      ev.preventDefault();

      try {
        const redirectTo = redirectToGameInSameFolder();
        console.debug('Using redirectTo:', redirectTo);

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo
          }
        });

        if (error) {
          console.error('Supabase signInWithOAuth error:', error);
          // Use a custom message box instead of alert()
          const messageBox = document.createElement('div');
          messageBox.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
          messageBox.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center">
              <h3 class="text-xl font-bold text-red-600 mb-4">Login Error</h3>
              <p class="text-gray-700 mb-6">${error.message || JSON.stringify(error)}</p>
              <button onclick="this.parentElement.parentElement.remove()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">OK</button>
            </div>
          `;
          document.body.appendChild(messageBox);
          return;
        }

        console.log('signInWithOAuth returned data:', data);

        // Some environments return a data.url you must navigate to manually
        if (data && data.url) {
          // Try a normal navigation first (keeps same tab)
          try {
            window.location.href = data.url;
          } catch (navErr) {
            // fallback: open in same tab/window
            window.open(data.url, '_self');
          }
        } else {
          // If no data.url, the browser should have been redirected automatically.
          console.log('No data.url returned — browser should handle redirect automatically.');
        }
      } catch (err) {
        console.error('Unexpected error during login:', err);
        // Use a custom message box instead of alert()
        const messageBox = document.createElement('div');
        messageBox.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        messageBox.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center">
            <h3 class="text-xl font-bold text-red-600 mb-4">Unexpected Error</h3>
            <p class="text-gray-700 mb-6">An unexpected error occurred. Please see console for details.</p>
            <button onclick="this.parentElement.parentElement.remove()" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">OK</button>
          </div>
        `;
        document.body.appendChild(messageBox);
      }
    });
  }
});
