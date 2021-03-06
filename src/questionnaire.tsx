import * as React from 'react';
import { v4 } from "uuid";
import { SimpleMap } from "@miqro/core";

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
  questionTextAreaSaveLabel: string;
  questionTextAreaClassName?: string;
  questionTextAreaButtonClassName?: string;
  questionSelectClassName?: string;
  questionTextAreaInputClassName?: string;
  questionSelectInputClassName?: string;
  questionSelectOptionClassName?: string;
  style?: { [k: string]: string };
  questionClassName?: string;
  onError?: (e: Error) => void;
  onResult?: (state: QuestionnaireStepState) => void;
  questionnaireGenerator: (scriptState: QuestionnaireStepState) => Promise<QuestionnaireStep>;
  renderTextAreaQuestion?: (stepId: string, step: QuestionnaireStep) => JSX.Element;
  renderSelectQuestion?: (stepId: string, step: QuestionnaireStep) => JSX.Element;
}

export interface QuestionnaireState {
  questionnaireId: string;
  currentState: QuestionnaireStepState;
  currentInput: string;
}

export class Questionnaire extends React.Component<QuestionnaireProps, QuestionnaireState> {
  private focusRef: React.RefObject<any>;

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
    this.focusRef = React.createRef();
    this.renderQuestion = this.renderQuestion.bind(this);
    this.renderTextAreaQuestion = this.renderTextAreaQuestion.bind(this);
    this.renderSelectQuestion = this.renderSelectQuestion.bind(this);
    this.nextStep = this.nextStep.bind(this);
  }

  componentDidMount(): void {
    this.nextStep();
  }

  protected nextStep(option?: string): void {
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
          if (this.focusRef && this.focusRef.current) {
            this.focusRef.current.focus();
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

  protected renderSelectQuestion(stepId: string, step: QuestionnaireStep): JSX.Element {
    return this.props.renderSelectQuestion ? this.props.renderSelectQuestion(stepId, step) : (
      <div
        className={this.props.questionSelectClassName ? this.props.questionSelectClassName : ""}>
        <select
          key={v4()}
          ref={this.focusRef}
          defaultValue={""}
          className={this.props.questionSelectInputClassName ? this.props.questionSelectInputClassName : ""}
          data-testid={`input-select-${step.text}`}
          onChange={event => this.nextStep(event.target.value)}>
          {
            [
              <option
                key={v4()}
                value={""} />
            ].concat(step.options.map(option => <option
              key={v4()}
              value={option}
              className={this.props.questionSelectOptionClassName ? this.props.questionSelectOptionClassName : ""}>
              {option}
            </option>))
          }
        </select>
      </div>
    );
  }

  protected renderTextAreaQuestion(stepId: string, step: QuestionnaireStep): JSX.Element {
    return this.props.renderTextAreaQuestion ? this.props.renderTextAreaQuestion(stepId, step) : (
      <div
        className={this.props.questionTextAreaClassName ? this.props.questionTextAreaClassName : ""}>
        <button
          key={v4()}
          data-testid={`input-text-save-${step.text}`}
          className={this.props.questionTextAreaButtonClassName ? this.props.questionTextAreaButtonClassName : ""}
          onClick={() => {
            this.nextStep(this.state.currentInput);
          }
          }>
            {this.props.questionTextAreaSaveLabel ? this.props.questionTextAreaSaveLabel : "save"}
          </button>
        <textarea
          key={`input-text-${stepId}`} // must be fixed for not to lose focus
          ref={this.focusRef}
          className={this.props.questionTextAreaInputClassName ? this.props.questionTextAreaInputClassName : ""}
          data-testid={`input-text-${step.text}`}
          value={this.state.currentInput}
          onChange={event => {
            this.setState({
              currentInput: event.target.value
            });
          }} />
      </div>);
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
          this.renderSelectQuestion(stepId, step)
        }
        {stepNumber === this.state.currentState.step && step.textInput &&
          this.renderTextAreaQuestion(stepId, step)
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
