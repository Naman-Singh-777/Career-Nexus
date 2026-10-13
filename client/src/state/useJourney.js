import { useCallback, useState } from "react";
import { analyzeResume, generateBlueprints, generateRoadmap } from "../api.js";

export const STAGES = {
  HERO: "hero",
  RESUME: "resume",
  ATS: "ats",
  PERSONA: "persona",
  DIRECTION: "direction",
  SYNTHESIS: "synthesis",
  BOARD: "board",
  ROADMAP: "roadmap",
};

const ORDER = [
  STAGES.HERO,
  STAGES.RESUME,
  STAGES.ATS,
  STAGES.PERSONA,
  STAGES.DIRECTION,
  STAGES.SYNTHESIS,
  STAGES.BOARD,
  STAGES.ROADMAP,
];

export function useJourney() {
  const [stage, setStage] = useState(STAGES.HERO);
  const [persona, setPersona] = useState(null); // "student" | "fresher" | "professional"
  const [direction, setDirection] = useState(null); // "transition" | "stay"
  const [profile, setProfile] = useState(null);
  const [blueprints, setBlueprints] = useState([]);
  const [sources, setSources] = useState([]);
  const [chosenBlueprint, setChosenBlueprint] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);
  const [synthesisLabel, setSynthesisLabel] = useState("Synthesizing");

  const goTo = useCallback((s) => setStage(s), []);
  const back = useCallback(() => {
    const i = ORDER.indexOf(stage);
    if (i > 0) setStage(ORDER[i - 1]);
  }, [stage]);

  // Resume goes first now: we parse the document and score it on its own
  // terms before asking anything about the person's situation.
  const submitResume = useCallback(async (file) => {
    setError(null);
    setStage(STAGES.SYNTHESIS);
    setSynthesisLabel("Parsing trajectory signal");
    try {
      const { profile: p } = await analyzeResume(file);
      setProfile(p);
      setStage(STAGES.ATS);
    } catch (e) {
      setError(e.message);
      setStage(STAGES.RESUME);
    }
  }, []);

  const continueFromAts = useCallback(() => setStage(STAGES.PERSONA), []);

  const runSynthesis = useCallback(async (p, dir, fallbackStage = STAGES.DIRECTION) => {
    setError(null);
    setStage(STAGES.SYNTHESIS);
    setSynthesisLabel(
      dir === "stay" ? "Mapping your advancement lattice" : "Scanning the trajectory space"
    );
    try {
      const { blueprints: bp, sources: src } = await generateBlueprints(p, dir);
      setBlueprints(bp);
      setSources(src || []);
      setStage(STAGES.BOARD);
    } catch (e) {
      setError(e.message);
      setStage(fallbackStage);
    }
  }, []);

  const choosePersona = useCallback(
    (p) => {
      setPersona(p);
      // Students and freshers have no "same role" to stay in, so we skip straight to
      // "transition" instead of asking a direction question that doesn't apply to them.
      if (p === "student" || p === "fresher") {
        setDirection("transition");
        runSynthesis(profile, "transition", STAGES.PERSONA);
      } else {
        setStage(STAGES.DIRECTION);
      }
    },
    [profile, runSynthesis]
  );

  const chooseDirection = useCallback(
    async (dir) => {
      setDirection(dir);
      await runSynthesis(profile, dir, STAGES.DIRECTION);
    },
    [profile, runSynthesis]
  );

  const chooseBlueprint = useCallback(
    async (bp) => {
      setChosenBlueprint(bp);
      setError(null);
      setStage(STAGES.SYNTHESIS);
      setSynthesisLabel("Sequencing your learning pathway");
      try {
        const rm = await generateRoadmap(profile, bp);
        setRoadmap(rm);
        setStage(STAGES.ROADMAP);
      } catch (e) {
        setError(e.message);
        setStage(STAGES.BOARD);
      }
    },
    [profile]
  );

  const restart = useCallback(() => {
    setStage(STAGES.HERO);
    setPersona(null);
    setDirection(null);
    setProfile(null);
    setBlueprints([]);
    setSources([]);
    setChosenBlueprint(null);
    setRoadmap(null);
    setError(null);
  }, []);

  return {
    stage,
    persona,
    direction,
    profile,
    blueprints,
    sources,
    chosenBlueprint,
    roadmap,
    error,
    synthesisLabel,
    goTo,
    back,
    submitResume,
    continueFromAts,
    choosePersona,
    chooseDirection,
    chooseBlueprint,
    restart,
  };
}
