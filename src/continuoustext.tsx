import * as React from 'react';
import {inspect} from "util";
import {v4} from "uuid";
import {SimpleMap} from "@miqro/core";

export interface ScriptState extends SimpleMap<any> {
  step: number;
  steps: readonly ScriptStep[];
  options: readonly string[];
}

export interface ScriptStep {
  text: string;
  scriptState?: Partial<ScriptState>;
  options?: string[];
}

export interface ContinuousTextProps {
  onError?: (e: Error) => void;
  scriptGenerator: (scriptState: ScriptState) => Promise<ScriptStep>;
}

export interface ContinuousTextState {
  currentState: ScriptState;
}

export class ContinuousText extends React.Component<ContinuousTextProps, ContinuousTextState> {
  constructor(props: ContinuousTextProps) {
    super(props);
    this.state = {
      currentState: {
        step: 0,
        options: [],
        steps: []
      }
    };
    this.renderStep = this.renderStep.bind(this);
    this.nextStep = this.nextStep.bind(this);
  }

  componentDidMount(): void {
    this.nextStep();
  }

  nextStep(): void {
    (async () => {
      const step = this.state.currentState.step;
      const steps = this.state.currentState.steps;
      console.log("running script generator");
      const result: ScriptStep = await this.props.scriptGenerator(this.state.currentState);
      console.log(`running script generator result [${inspect(result)}]`);
      this.setState({
        currentState: {
          ...this.state.currentState,
          step: step + 1,
          steps: steps.concat([result])
        }
      });
    })().catch((e) => {
      console.error(e);
      if (this.props.onError) {
        try {
          this.props.onError(e);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  renderStep(stepNumber: number, step: ScriptStep): JSX.Element {
    return (
      <div key={v4()}>
        <p key={v4()}>{step.text}</p>
        {step.options && stepNumber === this.state.currentState.step &&
        <select
          key={v4()}
          defaultValue={"select one"}
          data-testid={`input-select-${step.text}`}
          onChange={event => {
            this.setState({
              currentState: {
                ...this.state.currentState,
                options: this.state.currentState.options.concat([event.target.value])
              }
            }, this.nextStep);
          }}>
          {
            [
              <option
                key={v4()}
                value={"select one"}/>
            ].concat(step.options.map(option => <option key={v4()} value={option}>{option}</option>))
          }
        </select>
        }
        {step.options && stepNumber !== this.state.currentState.step &&
        <p data-testid={`input-select-result-${step.text}`}>{this.state.currentState.options[stepNumber - 1]}</p>
        }
      </div>
    );
  }

  render(): JSX.Element {
    return (
      <div>
        {
          this.state.currentState.steps.map((step, index) => this.renderStep(index + 1, step))
        }
      </div>
    );
  }
}
