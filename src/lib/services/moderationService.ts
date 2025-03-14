import ModLog from '@/models/ModLog';
import mongoose from 'mongoose';

interface CreateModLogParams {
  moderator: string;
  action: string;
  targetType: 'comment' | 'post' | 'user' | 'tag';
  targetId: string | mongoose.Types.ObjectId;
  reason: string;
  metadata?: any;
}

/**
 * Erstellt einen Moderations-Log-Eintrag in der Datenbank
 */
export async function createModLog(params: CreateModLogParams) {
  try {
    const { moderator, action, targetType, targetId, reason, metadata = {} } = params;
    
    const modLog = new ModLog({
      moderator,
      action,
      targetType,
      targetId,
      reason,
      metadata: {
        ...metadata,
        timestamp: new Date()
      }
    });
    
    await modLog.save();
    console.log(`Created ModLog entry: ${action} on ${targetType} by ${moderator}`);
    
    return modLog;
  } catch (error) {
    console.error('Error creating ModLog entry:', error);
    throw error;
  }
}

/**
 * Liest ModLog-Einträge für ein bestimmtes Ziel
 */
export async function getModLogsForTarget(targetType: string, targetId: string) {
  try {
    return await ModLog.find({
      targetType,
      targetId
    }).sort({ createdAt: -1 }).populate('moderator', 'username avatar');
  } catch (error) {
    console.error('Error fetching ModLogs:', error);
    throw error;
  }
}

/**
 * Liest die neuesten ModLog-Einträge
 */
export async function getRecentModLogs(limit = 20) {
  try {
    return await ModLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('moderator', 'username avatar')
      .populate('targetId');
  } catch (error) {
    console.error('Error fetching recent ModLogs:', error);
    throw error;
  }
}
