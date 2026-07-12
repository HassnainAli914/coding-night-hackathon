import { logger } from '../utils/logger';

export interface TriageResult {
  title: string;
  category: string;
  priority: string;
  possible_causes: string;
  initial_checks: string;
  warning?: string;
}

export class AiService {
  /**
   * Perform intelligent natural-language triage on user complaint.
   * Maps keywords to structured suggestions.
   */
  async triageComplaint(complaint: string, assetContext?: any): Promise<TriageResult> {
    logger.info(`Triage request received: "${complaint}"`);

    const text = complaint.toLowerCase();

    // ─── Rule-Based Intelligent NLP Classifier ───────
    if (text.includes('projector') || text.includes('display') || text.includes('hdmi') || text.includes('flicker')) {
      return {
        title: 'Projector display flickering / HDMI connection fault',
        category: 'AV / IT Hardware',
        priority: 'Medium',
        possible_causes: 'Damaged HDMI cable shielding, worn port contact pins, loose connector, lamp module overheating',
        initial_checks: 'Disconnect and firmly reconnect the HDMI cable; verify projector input source setting; test with an alternate laptop/device.',
        warning: 'Avoid looking directly into the projector lens assembly while turned on.'
      };
    }

    if (text.includes('ac') || text.includes('leak') || text.includes('cooling') || text.includes('air conditioner') || text.includes('compressor')) {
      const isCritical = text.includes('smoke') || text.includes('fire') || text.includes('spark');
      return {
        title: isCritical ? 'CRITICAL: AC electrical short / smoking unit' : 'Air Conditioner leakage & cooling inefficiency',
        category: 'HVAC / Electrical',
        priority: isCritical ? 'Critical' : 'High',
        possible_causes: isCritical 
          ? 'Compressor capacitor failure, electrical harness short-circuit' 
          : 'Blocked condensate drain line, iced evaporator coils, clogged air filter, refrigerant depletion',
        initial_checks: isCritical
          ? 'IMMEDIATELY turn off the circuit breaker powering the unit. Keep clear of the area.'
          : 'Power down the AC unit to prevent water damage from leaks; inspect air filters for dust accumulation.',
        warning: isCritical ? 'Danger of electrical shock or combustion. Do not attempt manual inspection.' : undefined
      };
    }

    if (text.includes('elevator') || text.includes('lift') || text.includes('stuck') || text.includes('door')) {
      return {
        title: 'Elevator mechanical fault / door sensor failure',
        category: 'Mechanical / Transport',
        priority: 'Critical',
        possible_causes: 'Obstruction in door tracks, safety interlock mismatch, motor governor trip, controller module lag',
        initial_checks: 'Do not attempt to pry doors open. Press the internal cabin emergency alarm button; verify cabin ventilation is active.',
        warning: 'Ensure a certified technician resolves this. In cabin entrapments, contact rescue services.'
      };
    }

    if (text.includes('pipe') || text.includes('leak') || text.includes('water') || text.includes('plumbing') || text.includes('tap') || text.includes('sink')) {
      return {
        title: 'Water pipe leakage / pressure drop',
        category: 'Plumbing / Facilities',
        priority: 'Medium',
        possible_causes: 'Degraded rubber washers, pipe wall corrosion, joint adhesive failure, pressure surge',
        initial_checks: 'Locate and turn off the nearest water isolation valve; place a bucket to contain pooling water; clear nearby valuables.',
      };
    }

    if (text.includes('wire') || text.includes('spark') || text.includes('plug') || text.includes('socket') || text.includes('power') || text.includes('switch')) {
      return {
        title: 'Electrical circuit breaker trip / socket arcing',
        category: 'Electrical',
        priority: 'High',
        possible_causes: 'Overloaded circuit branch, loose terminal screw connections, faulty appliance short',
        initial_checks: 'Unplug all connected devices on the circuit; do not touch any damp surfaces near the outlet.',
        warning: 'High voltage risk. Do not insert tools or fingers into wall receptacles.'
      };
    }

    // Default Fallback
    return {
      title: 'Reported equipment / facility fault',
      category: 'General Maintenance',
      priority: 'Medium',
      possible_causes: 'General mechanical wear, aging contacts, environmental stress factors',
      initial_checks: 'Safely disconnect power if applicable; post a temporary "Out of Service" sign; keep area clear.',
    };
  }
}

export const aiService = new AiService();
