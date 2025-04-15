import { NextResponse } from 'next/server';
import { createClient as createServer, createAdminClient } from '@/lib/supabase/server';

const getUsername = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single();

        if (error) {
            throw new Error(`Error fetching username: ${error.message}`);
        }

        return { username: data?.username };
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch username');
    }
};

const getEmail = async (supabase: any, userId: string) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        return { email: user?.email };
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch email');
    }
};

const getUserRank = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('get_user_rank', { user_id: userId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch user rank');
    }
};

const getSolvedProblemsByLanguage = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('get_solved_problems_by_language', { user_id: userId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching solved problems by language:', error);
        throw new Error('Unable to fetch solved problems by language');
    }
};

const getSolvedProblemsByTags = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('get_solved_problems_by_tags', { user_id: userId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching solved problems by tags:', error);
        throw new Error('Unable to fetch solved problems by tags');
    }
};

const getMonthlyScore = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('get_monthly_score', { user_id: userId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching monthly score:', error);
        throw new Error('Unable to fetch monthly score');
    }
};

const getSolvedProblemsByDifficulty = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('get_solved_problems_by_difficulty', { user_id: userId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching solved problems by difficulty:', error);
        throw new Error('Unable to fetch solved problems by difficulty');
    }
};

const getSubmissionHeatmap = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('get_submission_heatmap', { user_id: userId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching submission heatmap:', error);
        throw new Error('Unable to fetch submission heatmap');
    }
};

const getRecentAcProblems = async (supabase: any, userId: string) => {
    try {
        const { data, error } = await supabase.rpc('get_recent_ac_problems', { user_id: userId });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching recent AC problems:', error);
        throw new Error('Unable to fetch recent AC problems');
    }
};

const getProfileData = async (supabase: any, userId: string) => {
    const username = await getUsername(supabase, userId);
    const email = await getEmail(supabase, userId);
    const rank = await getUserRank(supabase, userId);
    const languages = await getSolvedProblemsByLanguage(supabase, userId);
    const skills = await getSolvedProblemsByTags(supabase, userId);
    const scoreHistory = await getMonthlyScore(supabase, userId);
    const difficulties = await getSolvedProblemsByDifficulty(supabase, userId);
    const heatmap = await getSubmissionHeatmap(supabase, userId);
    const recentAcProblems = await getRecentAcProblems(supabase, userId);
    console.log(skills);
    console.log(difficulties);
    console.log(recentAcProblems);

    return {
        username: username.username,
        email: email.email,
        rank: rank[0].user_rank,
        languages,
        skills,
        score_history: scoreHistory,
        difficulties,
        heatmap,
        recentAcProblems,
    };
};

// Profile Route Handler
export const GET = async (req: Request) => {
    try {
        const supabase = await createServer();

        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profileData = await getProfileData(supabase, session.user.id);

        return NextResponse.json({ profileData });
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};
