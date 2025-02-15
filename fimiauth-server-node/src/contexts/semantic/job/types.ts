import {AppShardId} from '../../../definitions/app.js';
import {Job} from '../../../definitions/job.js';
import {
  SemanticBaseProviderType,
  SemanticProviderMutationParams,
} from '../types.js';

export type SemanticJobProvider = SemanticBaseProviderType<Job> & {
  /** Expects `fromShardId` to not contain any active runners, so it migrates
   * "pending" and "in-progress" jobs */
  migrateShard(
    fromShardId: AppShardId,
    toShardId: AppShardId,
    opts: SemanticProviderMutationParams
  ): Promise<void>;
};
