import { config } from 'dotenv';
config();

import '@/ai/flows/cover-analysis.ts';
import '@/ai/flows/reverse-asin-analysis.ts';
import '@/ai/flows/compliance-check.ts';
import '@/ai/flows/niche-analysis.ts';
import '@/ai/flows/keyword-expander.ts';
import '@/ai/flows/keyword-clustering.ts';
import '@/ai/flows/title-assistant.ts';
import '@/ai/flows/description-assistant.ts';

