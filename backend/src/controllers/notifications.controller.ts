import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyFirebaseToken.js';
import { supabase } from '../config/supabase.js';
import admin from '../config/firebase.js';

export const registerToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    const { token, platform } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const { data: existing } = await supabase
      .from('push_tokens')
      .select('id')
      .eq('user_id', userId)
      .eq('platform', platform || 'web')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('push_tokens')
        .update({ token, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('push_tokens')
        .insert({ user_id: userId, token, platform: platform || 'web' });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Register token error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const unregisterToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.uid;
    const { platform } = req.body;

    const query = supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId);

    if (platform) {
      query.eq('platform', platform);
    }

    await query;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Unregister token error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, data: extraData } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token');

    if (!tokens || tokens.length === 0) {
      return res.status(200).json({ success: true, sent: 0, message: 'No registered tokens' });
    }

    const registrationTokens = tokens.map(t => t.token);
    const message = {
      notification: { title, body: body || '' },
      data: extraData || {},
      tokens: registrationTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    const successCount = response.successCount;
    const failureCount = response.failureCount;

    if (failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered') {
            invalidTokens.push(registrationTokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await supabase
          .from('push_tokens')
          .delete()
          .in('token', invalidTokens);
      }
    }

    return res.status(200).json({
      success: true,
      sent: successCount,
      failed: failureCount
    });
  } catch (error: any) {
    console.error('Send notification error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
