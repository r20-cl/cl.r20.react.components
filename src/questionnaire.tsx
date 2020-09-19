import * as React from 'react';
import {v4} from "uuid";
import {SimpleMap} from "@miqro/core";

export interface QuestionnaireStepState extends SimpleMap<any> {
  step: number;
  steps: readonly QuestionnaireStep[];
  options: readonly string[];
}

export interface QuestionnaireStep {
  text: string;
  questionClassName?: string;
  optionClassName?: string;
  state?: Partial<QuestionnaireStepState>;
  options?: string[];
  textInput?: boolean;
}

export interface QuestionnaireProps {
  className?: string;
  style?: { [k: string]: string };
  questionClassName?: string;
  onError?: (e: Error) => void;
  onResult?: (state: QuestionnaireStepState) => void;
  questionnaireGenerator: (scriptState: QuestionnaireStepState) => Promise<QuestionnaireStep>;
}

export interface QuestionnaireState {
  questionnaireId: string;
  currentState: QuestionnaireStepState;
  currentInput: string;
}

export class Questionnaire extends React.Component<QuestionnaireProps, QuestionnaireState> {
  constructor(props: QuestionnaireProps) {
    super(props);
    this.state = {
      questionnaireId: v4(), // this must be done for textarea not to lose focus
      currentInput: "",
      currentState: {
        step: 0,
        options: [],
        steps: []
      }
    };
    this.renderQuestion = this.renderQuestion.bind(this);
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
        const result: QuestionnaireStep = await this.props.questionnaireGenerator(this.state.currentState);
        this.setState({
          currentInput: "",
          currentState: {
            ...this.state.currentState,
            step: step + 1,
            steps: steps.concat([result])
          }
        }, () => {
          // Script ended
          if ((!result.options || result.options.length === 0) && !result.textInput) {
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
    if (option !== undefined) {
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

  renderQuestion(stepNumber: number, step: QuestionnaireStep): JSX.Element {
    const stepId = `${this.state.questionnaireId}-${step.text}-${stepNumber}`; // this must be done for textarea not to lose focus
    return (
      <div
        style={this.props.style}
        className={this.props.questionClassName ? this.props.questionClassName : ""}
        key={`question-step-${stepId}`}// must be fixed for text input not to lose focus
      >
        {step.text.split("\n").map(line =>
          <p
            className={step.questionClassName ? step.questionClassName : ""}
            key={v4()}>{line}</p>)}
        {step.options && stepNumber === this.state.currentState.step && !step.textInput &&
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
        {stepNumber === this.state.currentState.step && step.textInput &&
        <>
          <textarea
            key={`input-text-${stepId}`} // must be fixed for not to lose focus
            autoFocus={true}
            data-testid={`input-text-${step.text}`}
            value={this.state.currentInput}
            onChange={event => {
              this.setState({
                currentInput: event.target.value
              });
            }}/>
          <button
            key={v4()}
            data-testid={`input-text-save-${step.text}`}
            onClick={() => {
              this.nextStep(this.state.currentInput);
            }
            }>save
          </button>
        </>
        }
        {step.options && stepNumber !== this.state.currentState.step &&
        <p
          className={step.optionClassName ? step.optionClassName : ""}
          key={v4()}
          data-testid={`input-select-result-${step.text}`}>{this.state.currentState.options[stepNumber - 1]}</p>
        }
        {stepNumber !== this.state.currentState.step && step.textInput && this.state.currentState.options[stepNumber - 1] &&
        this.state.currentState.options[stepNumber - 1].split("\n").map(line =>
          <p
            className={step.optionClassName ? step.optionClassName : ""}
            data-testid={`input-text-result-${step.text}`}
            key={v4()}>{line}</p>)
        }
      </div>
    );
  }

  render(): JSX.Element {
    return (
      <div className={this.props.className}>
        {
          this.state.currentState.steps.map((step, index) => this.renderQuestion(index + 1, step))
        }
      </div>
    );
  }
}
