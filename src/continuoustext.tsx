import * as React from 'react';
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
  onResult?: (state: ScriptState) => void;
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

  nextStep(option?: string): void {
    const goNext = async () => {
      try {
        const step = this.state.currentState.step;
        const steps = this.state.currentState.steps;
        const result: ScriptStep = await this.props.scriptGenerator(this.state.currentState);
        this.setState({
          currentState: {
            ...this.state.currentState,
            step: step + 1,
            steps: steps.concat([result])
          }
        }, () => {
          // Script ended
          if (!result.options || result.options.length === 0) {
            if (this.props.onResult) {
              try {
                this.props.onResult(this.state.currentState);
              } catch (e) {
                console.error(e);
              }
            }
          }
        });
      } catch (e) {
        console.error(e);
        try {
          if (this.props.onError) {
            this.props.onError(e);
          }
        } catch (e2) {
          console.error(e2);
        }
      }
    }
    if (option) {
      this.setState({
        currentState: {
          ...this.state.currentState,
          options: this.state.currentState.options.concat([option])
        }
      }, goNext);
    } else {
      goNext();
    }
  }

  renderStep(stepNumber: number, step: ScriptStep): JSX.Element {
    return (
      <div key={v4()}>
        <p key={v4()}>{step.text}</p>
        {step.options && stepNumber === this.state.currentState.step &&
        <select
          key={v4()}
          defaultValue={""}
          data-testid={`input-select-${step.text}`}
          onChange={event => this.nextStep(event.target.value)}>
          {
            [
              <option
                key={v4()}
                value={""}/>
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
      <>
        {
          this.state.currentState.steps.map((step, index) => this.renderStep(index + 1, step))
        }
      </>
    );
  }
}
