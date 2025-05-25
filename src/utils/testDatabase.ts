import { supabase } from '@/lib/supabase';

export const testDatabaseConnection = async () => {
  console.log('Testing database connection...');

  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('Connection error:', connectionError);
      return false;
    }

    console.log('✅ Database connection successful');

    // Test tables exist
    const tables = ['issues', 'comments', 'updates', 'solutions', 'profiles'];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);

        if (error) {
          console.error(`❌ Table ${table} error:`, error);
          return false;
        } else {
          console.log(`✅ Table ${table} exists and is accessible`);
        }
      } catch (err) {
        console.error(`❌ Table ${table} test failed:`, err);
        return false;
      }
    }

    // Test foreign key relationships by fetching data separately
    try {
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, content, author_id')
        .limit(1);

      if (commentsError) {
        console.error('❌ Comments table error:', commentsError);
        return false;
      } else {
        console.log('✅ Comments table accessible');

        // Test profile lookup if we have comments
        if (comments && comments.length > 0) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, role')
            .eq('id', comments[0].author_id)
            .single();

          if (profileError) {
            console.log(
              '⚠️ Profile lookup failed (may be normal if no profile exists):',
              profileError.message
            );
          } else {
            console.log('✅ Profile lookup works');
          }
        }
      }
    } catch (err) {
      console.error('❌ Comments test failed:', err);
      return false;
    }

    try {
      const { data: updates, error: updatesError } = await supabase
        .from('updates')
        .select('id, content, author_id')
        .limit(1);

      if (updatesError) {
        console.error('❌ Updates table error:', updatesError);
        return false;
      } else {
        console.log('✅ Updates table accessible');
      }
    } catch (err) {
      console.error('❌ Updates test failed:', err);
      return false;
    }

    try {
      const { data: solutions, error: solutionsError } = await supabase
        .from('solutions')
        .select('id, title, proposed_by')
        .limit(1);

      if (solutionsError) {
        console.error('❌ Solutions table error:', solutionsError);
        return false;
      } else {
        console.log('✅ Solutions table accessible');
      }
    } catch (err) {
      console.error('❌ Solutions test failed:', err);
      return false;
    }

    console.log('✅ All database tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

export const testRealtimeConnection = async () => {
  console.log('Testing realtime connection...');

  try {
    const channel = supabase.channel('test-channel');

    const subscription = channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          console.log('✅ Realtime event received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Clean up after 5 seconds
    setTimeout(() => {
      subscription.unsubscribe();
      console.log('✅ Realtime test completed');
    }, 5000);

    return true;
  } catch (error) {
    console.error('❌ Realtime test failed:', error);
    return false;
  }
};

// Run tests when this module is imported in development
if (import.meta.env.DEV) {
  // Auto-run tests in development
  setTimeout(() => {
    testDatabaseConnection();
    testRealtimeConnection();
  }, 1000);
}
