// JSON schemas passed as Gemini `responseSchema`. Kept in one file so the
// shape the frontend renders and the shape Gemini is constrained to never
// drift apart.

export const PROFILE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    currentRole: { type: "STRING" },
    careerStage: {
      type: "STRING",
      enum: ["student", "fresher", "early_career", "mid_career", "senior"],
    },
    yearsExperience: { type: "NUMBER" },
    summary: { type: "STRING", description: "2-3 sentence synthesis of the candidate" },
    skills: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          category: {
            type: "STRING",
            enum: ["technical", "soft", "tool", "domain", "language", "methodology"],
          },
          proficiency: { type: "NUMBER", description: "0-100 estimate" },
        },
        required: ["name", "category", "proficiency"],
      },
    },
    experience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          company: { type: "STRING" },
          duration: { type: "STRING" },
          industry: { type: "STRING" },
          highlights: { type: "ARRAY", items: { type: "STRING" } },
        },
      },
    },
    education: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          degree: { type: "STRING" },
          institution: { type: "STRING" },
          year: { type: "STRING" },
        },
      },
    },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    gaps: { type: "ARRAY", items: { type: "STRING" } },
    atsScore: {
      type: "OBJECT",
      description:
        "A read of the resume as a document: how cleanly a typical applicant tracking " +
        "system would parse and rank it. This is not a match against any specific job.",
      properties: {
        overall: { type: "NUMBER", description: "0-100" },
        factors: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              score: { type: "NUMBER", description: "0-100" },
              note: { type: "STRING" },
            },
            required: ["name", "score"],
          },
        },
      },
      required: ["overall", "factors"],
    },
  },
  required: ["name", "careerStage", "summary", "skills"],
};

export const BLUEPRINTS_SCHEMA = {
  type: "OBJECT",
  properties: {
    blueprints: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          track: { type: "STRING", enum: ["transition", "advancement"] },
          compatibilityScore: { type: "NUMBER" },
          narrative: {
            type: "STRING",
            description: "Motivating, human-centric paragraph on why this path fits this person specifically",
          },
          whyThisFits: { type: "ARRAY", items: { type: "STRING" } },
          requiredSkills: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                importance: { type: "NUMBER" },
              },
              required: ["name", "importance"],
            },
          },
          skillGap: {
            type: "ARRAY",
            description: "For the radar chart: user's current level vs. what the role requires, per skill axis",
            items: {
              type: "OBJECT",
              properties: {
                skill: { type: "STRING" },
                userLevel: { type: "NUMBER" },
                requiredLevel: { type: "NUMBER" },
              },
              required: ["skill", "userLevel", "requiredLevel"],
            },
          },
          salaryRange: {
            type: "OBJECT",
            properties: {
              min: { type: "NUMBER" },
              max: { type: "NUMBER" },
              currency: { type: "STRING" },
            },
          },
          growthOutlook: { type: "STRING" },
          industryCompatibility: {
            type: "ARRAY",
            description: "Multi-factor score, e.g. Skill Overlap, Market Demand, Culture Fit, Growth Potential",
            items: {
              type: "OBJECT",
              properties: {
                factor: { type: "STRING" },
                score: { type: "NUMBER" },
              },
              required: ["factor", "score"],
            },
          },
        },
        required: ["title", "track", "compatibilityScore", "narrative", "requiredSkills", "skillGap"],
      },
    },
  },
  required: ["blueprints"],
};

export const ROADMAP_SCHEMA = {
  type: "OBJECT",
  properties: {
    careerTitle: { type: "STRING" },
    overview: { type: "STRING" },
    stages: {
      type: "ARRAY",
      description: "Ordered learning stages, basic to advanced, ending in interview/test prep",
      items: {
        type: "OBJECT",
        properties: {
          stageName: { type: "STRING" },
          order: { type: "NUMBER" },
          durationWeeks: { type: "NUMBER" },
          description: { type: "STRING" },
          topics: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                topic: { type: "STRING" },
                rationale: { type: "STRING" },
                youtubeQuery: {
                  type: "STRING",
                  description: "A natural search phrase someone would type into YouTube to find real videos on this exact topic at this exact stage",
                },
              },
              required: ["topic", "youtubeQuery"],
            },
          },
        },
        required: ["stageName", "order", "topics"],
      },
    },
  },
  required: ["careerTitle", "stages"],
};
