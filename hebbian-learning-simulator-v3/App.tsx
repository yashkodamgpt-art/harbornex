import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NUM_NEURONS } from './constants';
import NeuronBoard from './components/NeuronBoard';
import LogPanel from './components/LogPanel';
import Explanation from './components/Explanation';
import Controls from './components/Controls';
import IntroPage from './components/IntroPage';

export type NeuronState = 'idle' | 'pressed' | 'recalled';
export type Connection = {
  from: number;
  to: number;
  weight: number;
  type: 'pressed' | 'recalled';
};

const App: React.FC = () => {
  const [showApp, setShowApp] = useState<boolean>(false);
  const [weights, setWeights] = useState<number[][]>(() =>
    Array(NUM_NEURONS).fill(null).map(() => Array(NUM_NEURONS).fill(0))
  );
  const [neuronStates, setNeuronStates] = useState<NeuronState[]>(Array(NUM_NEURONS).fill('idle'));
  const [pressedNeurons, setPressedNeurons] = useState<number[]>([]);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [learningRate, setLearningRate] = useState<number>(1.0);
  const [decayRate, setDecayRate] = useState<number>(0.05);
  const [visualizedConnections, setVisualizedConnections] = useState<Connection[]>([]);
  const [isTurboOn, setIsTurboOn] = useState<boolean>(false);
  const [isLiveModeOn, setIsLiveModeOn] = useState<boolean>(false);
  const [isTimeModeOn, setIsTimeModeOn] = useState<boolean>(false);
  const [isCtrlHeld, setIsCtrlHeld] = useState<boolean>(false);
  
  const isProcessing = useRef(false);
  const propagationTimeoutId = useRef<number | null>(null);

  const applyDecayTo = useCallback((currentWeights: number[][]): number[][] => {
      if (decayRate <= 0) return currentWeights;
      return currentWeights.map(row =>
          row.map(weight => {
              const newWeight = weight - decayRate;
              return newWeight < 0 ? 0 : newWeight;
          })
      );
  }, [decayRate]);

  useEffect(() => {
    if (!isTimeModeOn || decayRate <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setWeights(prevWeights => applyDecayTo(prevWeights));
    }, 200); // 5 times per second

    return () => {
      clearInterval(intervalId);
    };
  }, [isTimeModeOn, decayRate, applyDecayTo]);

  const handleNeuronPress = useCallback((id: number) => {
    // Allow live mode to interrupt itself to be fluid.
    if (isProcessing.current && !isLiveModeOn) return;
    if (pressedNeurons.includes(id)) return;
    
    const newPressed = [...pressedNeurons, id];
    setPressedNeurons(newPressed);

    if (isLiveModeOn && !isCtrlHeld) {
        if (propagationTimeoutId.current) {
            clearTimeout(propagationTimeoutId.current);
        }
        isProcessing.current = true;
      
        let newWeights = weights.map(row => [...row]);
        const trainingConnections: Connection[] = [];
        let directExcitationOccurred = false;

        // --- TRAINING PHASE (Live & Immediate Event) ---
        if (newPressed.length > 1) {
            directExcitationOccurred = true;
            const directLearningRate = isTurboOn ? 6.0 : learningRate;
            for (let i = 0; i < newPressed.length; i++) {
                for (let j = i + 1; j < newPressed.length; j++) {
                    const neuron1 = newPressed[i];
                    const neuron2 = newPressed[j];
                    newWeights[neuron1][neuron2] += directLearningRate;
                    newWeights[neuron2][neuron1] = newWeights[neuron1][neuron2];

                    trainingConnections.push({
                        from: neuron1,
                        to: neuron2,
                        weight: newWeights[neuron1][neuron2],
                        type: 'pressed'
                    });
                }
            }
             if (newPressed.length === 2 && pressedNeurons.length === 1) {
                setLogMessages(prev => [...prev, `LIVE EVENT: Association started between ${newPressed.join(' & ')}.`]);
            }
            // A direct excitation event occurred, so apply decay if not in time mode.
            if (!isTimeModeOn) {
              newWeights = applyDecayTo(newWeights);
            }
        }
        
        setWeights(newWeights); // Apply weight changes from direct excitation + decay

        // Immediately update UI for what's being pressed
        const initialStates = Array(NUM_NEURONS).fill('idle');
        newPressed.forEach(n => initialStates[n] = 'pressed');
        setNeuronStates(initialStates);
        setVisualizedConnections(trainingConnections);


        // --- RECALL PHASE (Live & Asynchronous Events) ---
        const recalledNeurons = new Set<number>(newPressed);

        const propagateLiveWave = (currentWeights: number[][], neuronsToProcess: number[], isFirstWave: boolean) => {
            const newlyActivatedThisWave: number[] = [];
            const newRecalledConnections: Connection[] = [];
            let newActivationsFound = false;

            for (const sourceNeuron of neuronsToProcess) {
                for (let targetNeuron = 0; targetNeuron < NUM_NEURONS; targetNeuron++) {
                    if (!recalledNeurons.has(targetNeuron) && currentWeights[sourceNeuron][targetNeuron] >= 5) {
                        recalledNeurons.add(targetNeuron);
                        newlyActivatedThisWave.push(targetNeuron);
                        newRecalledConnections.push({
                            from: sourceNeuron,
                            to: targetNeuron,
                            weight: currentWeights[sourceNeuron][targetNeuron],
                            type: 'recalled',
                        });
                        newActivationsFound = true;
                    }
                }
            }
            
            if (newActivationsFound) {
                setVisualizedConnections(prev => [...prev, ...newRecalledConnections]);
                setNeuronStates(prev => {
                    const newStates = [...prev];
                    newlyActivatedThisWave.forEach(n => newStates[n] = 'recalled');
                    return newStates;
                });
                
                // --- Secondary Learning & Decay Event ---
                let weightsAfterLearning = currentWeights.map(row => [...row]);
                let connectionsLearned = 0;
                
                // Learn between activators (neuronsToProcess) and activated (newlyActivatedThisWave)
                for (const activator of neuronsToProcess) {
                    for (const activated of newlyActivatedThisWave) {
                        if (activator === activated) continue;
                        const n1 = Math.min(activator, activated);
                        const n2 = Math.max(activator, activated);
                        weightsAfterLearning[n1][n2] += learningRate; // Secondary learning always uses slider value
                        weightsAfterLearning[n2][n1] = weightsAfterLearning[n1][n2];
                        connectionsLearned++;
                    }
                }

                // Learn among the newly activated group
                if (newlyActivatedThisWave.length > 1) {
                    for (let i = 0; i < newlyActivatedThisWave.length; i++) {
                        for (let j = i + 1; j < newlyActivatedThisWave.length; j++) {
                            const n1 = newlyActivatedThisWave[i];
                            const n2 = newlyActivatedThisWave[j];
                            weightsAfterLearning[n1][n2] += learningRate; // Secondary learning always uses slider value
                            weightsAfterLearning[n2][n1] = weightsAfterLearning[n1][n2];
                            connectionsLearned++;
                        }
                    }
                }
                
                if (connectionsLearned > 0) {
                     setLogMessages(prev => [...prev, `LIVE EVENT: Secondary excitation strengthened ${connectionsLearned} link(s).`]);
                }

                const weightsAfterDecay = isTimeModeOn ? weightsAfterLearning : applyDecayTo(weightsAfterLearning);
                setWeights(weightsAfterDecay);

                propagationTimeoutId.current = window.setTimeout(() => propagateLiveWave(weightsAfterDecay, newlyActivatedThisWave, false), 200);
            } else {
                // Propagation finished. 
                // If this was the first wave and no direct excitation happened (i.e., a single press),
                // it's still an event and must trigger decay.
                if (isFirstWave && !directExcitationOccurred) {
                    if (!isTimeModeOn) {
                      setWeights(applyDecayTo(currentWeights));
                    }
                }
                propagationTimeoutId.current = window.setTimeout(() => {
                    setNeuronStates(Array(NUM_NEURONS).fill('idle'));
                    setVisualizedConnections([]);
                    isProcessing.current = false;
                    propagationTimeoutId.current = null;
                }, 200);
            }
        };
        
        propagationTimeoutId.current = window.setTimeout(() => propagateLiveWave(newWeights, [...newPressed], true), 200);

    } else { // Original logic (also handles Live Mode + Ctrl)
      setNeuronStates(prev => {
        const newStates = [...prev];
        newStates[id] = 'pressed';
        return newStates;
      });

      if (newPressed.length > 1) {
        const newConnections: Connection[] = [];
        for (let i = 0; i < newPressed.length; i++) {
          for (let j = i + 1; j < newPressed.length; j++) {
              const fromNeuron = newPressed[i];
              const toNeuron = newPressed[j];
              newConnections.push({
                  from: fromNeuron, 
                  to: toNeuron, 
                  weight: weights[fromNeuron][toNeuron], 
                  type: 'pressed'
              });
          }
        }
        setVisualizedConnections(newConnections);
      }
    }
  }, [pressedNeurons, weights, isLiveModeOn, learningRate, decayRate, isTurboOn, isTimeModeOn, applyDecayTo, isCtrlHeld]);

  const handleReset = useCallback(() => {
    if (propagationTimeoutId.current) {
        clearTimeout(propagationTimeoutId.current);
        propagationTimeoutId.current = null;
    }
    setWeights(Array(NUM_NEURONS).fill(null).map(() => Array(NUM_NEURONS).fill(0)));
    setNeuronStates(Array(NUM_NEURONS).fill('idle'));
    setPressedNeurons([]);
    setVisualizedConnections([]);
    setLogMessages(['Memory Cleared.']);
    setLearningRate(1.0);
    setDecayRate(0.05);
    setIsTurboOn(false);
    setIsLiveModeOn(false);
    setIsTimeModeOn(false);
    isProcessing.current = false;
  }, []);

  const handleToggleTurbo = useCallback(() => {
    setIsTurboOn(prev => !prev);
  }, []);

  const handleToggleLiveMode = useCallback(() => {
      setIsLiveModeOn(prev => !prev);
  }, []);

  const handleToggleTimeMode = useCallback(() => {
    setIsTimeModeOn(prev => !prev);
  }, []);

  const handleZap = useCallback(() => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setLogMessages(prev => [...prev, 'ZAP EVENT: Searching for active networks...']);

    const threshold = 5;
    const visited = new Array(NUM_NEURONS).fill(false);
    const networks: number[][] = [];

    // 1. Find all networks (connected components)
    for (let i = 0; i < NUM_NEURONS; i++) {
      if (!visited[i]) {
        const currentNetwork: number[] = [];
        const stack: number[] = [i];
        visited[i] = true;

        while (stack.length > 0) {
          const u = stack.pop()!;
          currentNetwork.push(u);

          for (let v = 0; v < NUM_NEURONS; v++) {
            if (!visited[v] && weights[u][v] >= threshold) {
              visited[v] = true;
              stack.push(v);
            }
          }
        }
        // Only consider networks of size 2 or more
        if (currentNetwork.length > 1) {
          networks.push(currentNetwork);
        }
      }
    }

    if (networks.length === 0) {
      setLogMessages(prev => [...prev, 'ZAP FINISHED: No active networks found (W >= 5).']);
      isProcessing.current = false;
      return;
    }

    setLogMessages(prev => [...prev, `ZAP EVENT: Found ${networks.length} independent network(s).`]);

    // 2. Find the hub neuron for each network
    const hubNeurons: number[] = [];
    for (const network of networks) {
      let bestNeuron = -1;
      let maxDegree = -1;
      let maxWeightSum = -1;

      for (const neuron of network) {
        let currentDegree = 0;
        let currentWeightSum = 0;
        for (const other of network) {
          if (neuron !== other && weights[neuron][other] >= threshold) {
            currentDegree++;
            currentWeightSum += weights[neuron][other];
          }
        }

        if (currentDegree > maxDegree) {
          maxDegree = currentDegree;
          maxWeightSum = currentWeightSum;
          bestNeuron = neuron;
        } else if (currentDegree === maxDegree && currentWeightSum > maxWeightSum) {
          maxWeightSum = currentWeightSum;
          bestNeuron = neuron;
        }
      }
      if (bestNeuron !== -1) {
        hubNeurons.push(bestNeuron);
      }
    }

    if (hubNeurons.length === 0) {
      setLogMessages(prev => [...prev, 'ZAP FAILED: Could not identify hub neurons.']);
      isProcessing.current = false;
      return;
    }

    setLogMessages(prev => [...prev, `ZAP EVENT: Initiating recall from hubs: ${hubNeurons.join(', ')}.`]);

    // 3. Propagate the visual wave (NO learning, NO decay)
    const activated = new Set<number>(hubNeurons);

    setNeuronStates(prev => {
      const newStates = [...prev];
      hubNeurons.forEach(id => newStates[id] = 'recalled');
      return newStates;
    });

    const propagateZapWave = (neuronsToProcess: number[]) => {
      const newlyActivatedThisWave: number[] = [];
      const newConnections: Connection[] = [];
      let newActivationsFound = false;

      for (const sourceNeuron of neuronsToProcess) {
        for (let targetNeuron = 0; targetNeuron < NUM_NEURONS; targetNeuron++) {
          if (!activated.has(targetNeuron) && weights[sourceNeuron][targetNeuron] >= threshold) {
            activated.add(targetNeuron);
            newlyActivatedThisWave.push(targetNeuron);
            newConnections.push({
              from: sourceNeuron,
              to: targetNeuron,
              weight: weights[sourceNeuron][targetNeuron],
              type: 'recalled',
            });
            newActivationsFound = true;
          }
        }
      }

      if (newActivationsFound) {
        setNeuronStates(prev => {
          const newStates = [...prev];
          activated.forEach(id => newStates[id] = 'recalled');
          return newStates;
        });
        setVisualizedConnections(prev => [...prev, ...newConnections]);
        setTimeout(() => propagateZapWave(newlyActivatedThisWave), 200);
      } else {
        setLogMessages(prev => [...prev, `ZAP FINISHED: All networks activated.`]);
        setTimeout(() => {
          setNeuronStates(Array(NUM_NEURONS).fill('idle'));
          setVisualizedConnections([]);
          isProcessing.current = false;
        }, 500);
      }
    };

    setTimeout(() => propagateZapWave(hubNeurons), 200);
  }, [weights]);


  const handleLearningAndRecall = useCallback((isFromCtrlRelease = false) => {
    if (isLiveModeOn) {
        // This is a Ctrl+release event in live mode. Time to process the batch.
        if (isFromCtrlRelease) {
            if (pressedNeurons.length === 0 || isProcessing.current) {
                if (pressedNeurons.length > 0) setPressedNeurons([]);
                return;
            }

            isProcessing.current = true;
            let newWeights = weights.map(row => [...row]);
            const trainingConnections: Connection[] = [];
            let directExcitationOccurred = false;

            // --- TRAINING PHASE (Live Batch Event) ---
            if (pressedNeurons.length > 1) {
                directExcitationOccurred = true;
                const directLearningRate = isTurboOn ? 6.0 : learningRate;
                for (let i = 0; i < pressedNeurons.length; i++) {
                    for (let j = i + 1; j < pressedNeurons.length; j++) {
                        const neuron1 = pressedNeurons[i];
                        const neuron2 = pressedNeurons[j];
                        newWeights[neuron1][neuron2] += directLearningRate;
                        newWeights[neuron2][neuron1] = newWeights[neuron1][neuron2];
                        trainingConnections.push({ from: neuron1, to: neuron2, weight: newWeights[neuron1][neuron2], type: 'pressed' });
                    }
                }
                if (pressedNeurons.length >= 2) {
                    setLogMessages(prev => [...prev, `LIVE EVENT (Ctrl): Association started between ${pressedNeurons.join(' & ')}.`]);
                }
                if (!isTimeModeOn) {
                    newWeights = applyDecayTo(newWeights);
                }
            }
            setWeights(newWeights);
            setVisualizedConnections(trainingConnections);

            // --- RECALL PHASE (Live & Asynchronous Events) ---
            const recalledNeurons = new Set<number>(pressedNeurons);
            const propagateLiveWave = (currentWeights: number[][], neuronsToProcess: number[], isFirstWave: boolean) => {
                const newlyActivatedThisWave: number[] = [];
                const newRecalledConnections: Connection[] = [];
                let newActivationsFound = false;

                for (const sourceNeuron of neuronsToProcess) {
                    for (let targetNeuron = 0; targetNeuron < NUM_NEURONS; targetNeuron++) {
                        if (!recalledNeurons.has(targetNeuron) && currentWeights[sourceNeuron][targetNeuron] >= 5) {
                            recalledNeurons.add(targetNeuron);
                            newlyActivatedThisWave.push(targetNeuron);
                            newRecalledConnections.push({ from: sourceNeuron, to: targetNeuron, weight: currentWeights[sourceNeuron][targetNeuron], type: 'recalled' });
                            newActivationsFound = true;
                        }
                    }
                }
                if (newActivationsFound) {
                    setVisualizedConnections(prev => [...prev, ...newRecalledConnections]);
                    setNeuronStates(prev => {
                        const newStates = [...prev];
                        newlyActivatedThisWave.forEach(n => newStates[n] = 'recalled');
                        return newStates;
                    });
                    let weightsAfterLearning = currentWeights.map(row => [...row]);
                    let connectionsLearned = 0;
                    for (const activator of neuronsToProcess) { for (const activated of newlyActivatedThisWave) { if (activator === activated) continue; const n1 = Math.min(activator, activated); const n2 = Math.max(activator, activated); weightsAfterLearning[n1][n2] += learningRate; weightsAfterLearning[n2][n1] = weightsAfterLearning[n1][n2]; connectionsLearned++; } }
                    if (newlyActivatedThisWave.length > 1) { for (let i = 0; i < newlyActivatedThisWave.length; i++) { for (let j = i + 1; j < newlyActivatedThisWave.length; j++) { const n1 = newlyActivatedThisWave[i]; const n2 = newlyActivatedThisWave[j]; weightsAfterLearning[n1][n2] += learningRate; weightsAfterLearning[n2][n1] = weightsAfterLearning[n1][n2]; connectionsLearned++; } } }
                    if (connectionsLearned > 0) { setLogMessages(prev => [...prev, `LIVE EVENT: Secondary excitation strengthened ${connectionsLearned} link(s).`]); }
                    const weightsAfterDecay = isTimeModeOn ? weightsAfterLearning : applyDecayTo(weightsAfterLearning);
                    setWeights(weightsAfterDecay);
                    propagationTimeoutId.current = window.setTimeout(() => propagateLiveWave(weightsAfterDecay, newlyActivatedThisWave, false), 200);
                } else {
                    if (isFirstWave && !directExcitationOccurred) { if (!isTimeModeOn) { setWeights(applyDecayTo(currentWeights)); } }
                    propagationTimeoutId.current = window.setTimeout(() => {
                        setNeuronStates(Array(NUM_NEURONS).fill('idle'));
                        setVisualizedConnections([]);
                        isProcessing.current = false;
                        propagationTimeoutId.current = null;
                    }, 200);
                }
            };
            propagationTimeoutId.current = window.setTimeout(() => propagateLiveWave(newWeights, [...pressedNeurons], true), 200);
            setPressedNeurons([]);
            return;
        } else {
            // This is a touch/mouse gesture finishing. The propagation is already running. Just clear the buffer.
            if (pressedNeurons.length > 0) {
                setLogMessages(prev => [...prev, `Input gesture finished. Propagation continues...`]);
            }
            setPressedNeurons([]);
            return;
        }
    }

    if (pressedNeurons.length === 0 || isProcessing.current) {
      if(pressedNeurons.length > 0) setPressedNeurons([]);
      return;
    }

    isProcessing.current = true;

    // --- TRAINING PHASE (Direct Excitation Event) ---
    if (pressedNeurons.length > 1) {
       setLogMessages(prev => [...prev, `EVENT: Direct excitation on ${pressedNeurons.join(', ')}. Learning...`]);
       setWeights(prevWeights => {
            let newWeights = prevWeights.map(row => [...row]);
            const directLearningRate = isTurboOn ? 6.0 : learningRate;
            
            // 1. Strengthen connections
            for (let i = 0; i < pressedNeurons.length; i++) {
                for (let j = i + 1; j < pressedNeurons.length; j++) {
                    const neuron1 = pressedNeurons[i];
                    const neuron2 = pressedNeurons[j];
                    newWeights[neuron1][neuron2] += directLearningRate;
                    newWeights[neuron2][neuron1] = newWeights[neuron1][neuron2];
                }
            }

            // 2. Apply decay for this event if not in time mode
            return isTimeModeOn ? newWeights : applyDecayTo(newWeights);
        });

      setTimeout(() => {
        setNeuronStates(Array(NUM_NEURONS).fill('idle'));
        setVisualizedConnections([]);
        isProcessing.current = false;
      }, 500);

    // --- RECALL PHASE (Asynchronous Events) ---
    } else if (pressedNeurons.length === 1) {
      const neuronId = pressedNeurons[0];
      const activated = new Set<number>([neuronId]);

      setNeuronStates(prev => {
          const newStates = [...prev];
          newStates[neuronId] = 'recalled';
          return newStates;
      });
      setLogMessages(prev => [...prev, `EVENT: Initiating recall from Neuron ${neuronId}.`]);


      const propagateWave = (currentWeights: number[][], neuronsToProcess: number[], isFirstWave: boolean) => {
        const newlyActivatedThisWave: number[] = [];
        const newConnections: Connection[] = [];
        let newActivationsFound = false;

        for (const sourceNeuron of neuronsToProcess) {
          for (let targetNeuron = 0; targetNeuron < NUM_NEURONS; targetNeuron++) {
            if (
              !activated.has(targetNeuron) &&
              currentWeights[sourceNeuron][targetNeuron] >= 5
            ) {
              activated.add(targetNeuron);
              newlyActivatedThisWave.push(targetNeuron);
              newConnections.push({
                from: sourceNeuron,
                to: targetNeuron,
                weight: currentWeights[sourceNeuron][targetNeuron],
                type: 'recalled',
              });
              newActivationsFound = true;
            }
          }
        }

        if (newActivationsFound) {
          setNeuronStates(prev => {
            const newStates = [...prev];
            activated.forEach(id => newStates[id] = 'recalled');
            return newStates;
          });
          setVisualizedConnections(prev => [...prev, ...newConnections]);
          
          // --- Secondary Learning & Decay Event ---
          let weightsAfterLearning = currentWeights.map(row => [...row]);
          let connectionsLearned = 0;

          // Learn between activators (neuronsToProcess) and newly activated (newlyActivatedThisWave)
          for (const activator of neuronsToProcess) {
              for (const activatedNeuron of newlyActivatedThisWave) {
                  if (activator === activatedNeuron) continue;
                  const n1 = Math.min(activator, activatedNeuron);
                  const n2 = Math.max(activator, activatedNeuron);
                  weightsAfterLearning[n1][n2] += learningRate; // Secondary learning always uses slider value
                  weightsAfterLearning[n2][n1] = weightsAfterLearning[n1][n2];
                  connectionsLearned++;
              }
          }

          // Learn among the newly activated group
          if (newlyActivatedThisWave.length > 1) {
              for (let i = 0; i < newlyActivatedThisWave.length; i++) {
                  for (let j = i + 1; j < newlyActivatedThisWave.length; j++) {
                      const n1 = newlyActivatedThisWave[i];
                      const n2 = newlyActivatedThisWave[j];
                      weightsAfterLearning[n1][n2] += learningRate; // Secondary learning always uses slider value
                      weightsAfterLearning[n2][n1] = weightsAfterLearning[n1][n2];
                      connectionsLearned++;
                  }
              }
          }

          if (connectionsLearned > 0) {
              setLogMessages(prev => [...prev, `EVENT: Secondary excitation strengthened ${connectionsLearned} link(s).`]);
          }
          
          const weightsAfterDecay = isTimeModeOn ? weightsAfterLearning : applyDecayTo(weightsAfterLearning);
          setWeights(weightsAfterDecay);

          setTimeout(() => propagateWave(weightsAfterDecay, newlyActivatedThisWave, false), 200);
        } else {
          // Propagation finished.
          if (isFirstWave) {
            // This was the initial recall attempt, but it yielded no results.
            // It is still one event and must trigger decay if not in time mode.
            if (!isTimeModeOn) {
              setWeights(applyDecayTo(currentWeights));
            }
          }

          const recalledWithoutSelf = Array.from(activated).filter(id => id !== neuronId);
          if (recalledWithoutSelf.length > 0) {
            setLogMessages(prev => [...prev, `RECALL FINISHED: Neuron ${neuronId} activated network of ${recalledWithoutSelf.length} other neurons.`]);
          } else {
            setLogMessages(prev => [...prev, `RECALL FINISHED: Neuron ${neuronId} has no strong associations (W >= 5).`]);
          }
          
          setTimeout(() => {
            setNeuronStates(Array(NUM_NEURONS).fill('idle'));
            setVisualizedConnections([]);
            isProcessing.current = false;
          }, 200);
        }
      };

      setTimeout(() => propagateWave(weights, [neuronId], true), 200);
    }
    
    setPressedNeurons([]);

  }, [pressedNeurons, weights, learningRate, decayRate, isLiveModeOn, isTurboOn, isTimeModeOn, applyDecayTo]);

  useEffect(() => {
    const handleMouseUp = () => {
      // If holding control, wait for the keyup event to trigger recall.
      if (isCtrlHeld) return;
      // We delay this slightly to allow a final neuron press to register.
      setTimeout(() => handleLearningAndRecall(false), 10);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Don't interfere with Ctrl+click functionality.
      if (isCtrlHeld) return;
      
      // Only trigger the learning/recall event when the *last* finger is lifted.
      if (e.touches.length === 0) {
        setTimeout(() => handleLearningAndRecall(false), 10);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleLearningAndRecall, isCtrlHeld]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' && !e.repeat) {
        setIsCtrlHeld(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        setIsCtrlHeld(false);
        // Trigger learning/recall when Ctrl is released
        setTimeout(() => handleLearningAndRecall(true), 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleLearningAndRecall]);

  const handleStart = () => {
    setShowApp(true);
    setLogMessages(['Simulation Initialized.']);
  };

  const handleBackToIntro = () => {
    setShowApp(false);
  };

  if (!showApp) {
    return <IntroPage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 font-sans text-gray-200" style={{ minHeight: '100dvh' }}>
       <div className="w-full max-w-lg mx-auto flex flex-col h-full" style={{ height: 'calc(100dvh - 1rem)' }}>

        <p className="text-center text-gray-400 italic text-xs mb-4">
          neurons that fire together, wire together.
        </p>

        <header className="flex-shrink-0 mb-4">
          <Controls 
            onReset={handleReset}
            learningRate={learningRate}
            setLearningRate={setLearningRate}
            isTurboOn={isTurboOn}
            onToggleTurbo={handleToggleTurbo}
            isLiveModeOn={isLiveModeOn}
            onToggleLiveMode={handleToggleLiveMode}
            isTimeModeOn={isTimeModeOn}
            onToggleTimeMode={handleToggleTimeMode}
            decayRate={decayRate}
            setDecayRate={setDecayRate}
            onZap={handleZap}
            onBack={handleBackToIntro}
          />
        </header>
        
        <main className="flex-grow flex justify-center items-center relative">
            <NeuronBoard 
                neuronStates={neuronStates} 
                onNeuronPress={handleNeuronPress}
                connections={visualizedConnections}
                weights={weights}
            />
            <div className="w-48 flex-shrink-0 absolute left-full ml-4 hidden md:block">
                 <Explanation />
            </div>
        </main>

        <footer className="flex-shrink-0 mt-4">
          <LogPanel messages={logMessages} />
        </footer>

      </div>
    </div>
  );
};

export default App;