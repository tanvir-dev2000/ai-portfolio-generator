import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    accessToken: async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(false);
        return token;
      }
      return null;
    },
  }
);

export default supabase;
