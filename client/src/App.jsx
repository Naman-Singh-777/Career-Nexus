import { AnimatePresence } from "framer-motion";
import ParticleField from "./components/ParticleField.jsx";
import GrainOverlay from "./components/GrainOverlay.jsx";
import Hero from "./components/Hero.jsx";
import PersonaStep from "./components/PersonaStep.jsx";
import ResumeStep from "./components/ResumeStep.jsx";
import DirectionStep from "./components/DirectionStep.jsx";
import SynthesisLoader from "./components/SynthesisLoader.jsx";
import BlueprintBoard from "./components/BlueprintBoard.jsx";
import RoadmapView from "./components/RoadmapView.jsx";
import { useJourney, STAGES } from "./state/useJourney.js";

export default function App() {
  const j = useJourney();

  return (
    <div className="ambient-field relative min-h-screen w-full">
      <ParticleField className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70" />
      <GrainOverlay />

      <AnimatePresence mode="wait">
        {j.stage === STAGES.HERO && <Hero key="hero" onBegin={() => j.goTo(STAGES.PERSONA)} />}

        {j.stage === STAGES.PERSONA && <PersonaStep key="persona" onChoose={j.choosePersona} />}

        {j.stage === STAGES.RESUME && (
          <ResumeStep key="resume" error={j.error} onSubmit={j.submitResume} />
        )}

        {j.stage === STAGES.DIRECTION && (
          <DirectionStep key="direction" profile={j.profile} onChoose={j.chooseDirection} error={j.error} />
        )}

        {j.stage === STAGES.SYNTHESIS && <SynthesisLoader key="synthesis" label={j.synthesisLabel} />}

        {j.stage === STAGES.BOARD && (
          <BlueprintBoard
            key="board"
            blueprints={j.blueprints}
            sources={j.sources}
            onChoose={j.chooseBlueprint}
          />
        )}

        {j.stage === STAGES.ROADMAP && j.roadmap && (
          <RoadmapView key="roadmap" roadmap={j.roadmap} onRestart={j.restart} />
        )}
      </AnimatePresence>
    </div>
  );
}
