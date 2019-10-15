import * as React from 'react';
import { LangContainer } from '../../shared/lang';
import { formatString } from '../../shared/utils/StringFormatter';
import { LangContext } from '../util/lang';
import { ConfirmElement, ConfirmElementArgs } from './ConfirmElement';
import { ImagePreview } from './ImagePreview';
import { OpenIcon } from './OpenIcon';
import { SimpleButton } from './SimpleButton';

type GameImageSplitProps = {
  /** The internal name of the image */
  type: string;
  /** Localized name of image (for button) */
  text: string;
  /** Source of the image (undefined if there is no image). */
  imgSrc?: string;
  /** Called when the "add" button is clicked. This button is only shown while there is no image. */
  onAddClick: (type: string) => void;
  /** Called when the "remove" button is clicked. This button is only shown while there is an image. */
  onRemoveClick: (type: string) => void;
  /** Called when something is dropped on this component. */
  onDrop: (event: React.DragEvent, type: string) => void;
  /** If the user should not be able to add a new image. */
  disabled?: boolean;
};

type GameImageSplitState = {
  /** If the cursor is dragging something over this element. */
  hover: boolean;
  /** If the preview should be shown */
  showPreview: boolean;
};

export interface GameImageSplit {
  context: LangContainer;
}

/**
 * An "image slot" inside the "game image split" area.
 * This component will either display a text and an "add" button, or an image and a "remove" button (depending on if the image source is undefined).
 * It's meant to be used for displaying the current, or allowing the user to add a new, image for a game.
 */
export class GameImageSplit extends React.Component<GameImageSplitProps, GameImageSplitState> {
  constructor(props: GameImageSplitProps) {
    super(props);
    this.state = {
      hover: false,
      showPreview: false
    };
  }

  render() {
    const strings = this.context.misc;
    const { disabled, imgSrc, text } = this.props;
    const { hover, showPreview } = this.state;
    // Class name
    let className = 'game-image-split';
    if (imgSrc === undefined) { className += ' simple-center'; }
    if (hover)                { className += ' game-image-split--hover'; }
    if (disabled)             { className += ' game-image-split--disabled'; }
    // Render
    return (
      <div
        className={className}
        style={{ backgroundImage: imgSrc ? `url("${imgSrc}")` : undefined }}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onClick={this.onPreview}
        onDrop={this.onDrop}>
        { (imgSrc === undefined) ? (
          <div className='game-image-split__not-found'>
            <h1>{formatString(strings.noBlankFound, text)}</h1>
            <SimpleButton
              value={formatString(strings.addBlank, text)}
              onClick={this.onAddClick}
              disabled={disabled} />
          </div>
        ) : (
          <div className='game-image-split__buttons'>
            <p>{text}</p>
            <ConfirmElement
              onConfirm={this.onRemoveClick}
              children={renderDeleteImageButton}
              extra={[strings, text, !!disabled]} />
            { showPreview ?
              <ImagePreview
                src={this.props.imgSrc}
                onCancel={this.onPreviewCancel}
                />
            : undefined }
          </div>
        )}
      </div>
    );
  }

  onAddClick = (event: React.MouseEvent) => {
    this.props.onAddClick(this.props.type);
  }

  onRemoveClick = () => {
    this.props.onRemoveClick(this.props.type);
  }

  onDragOver = (event: React.DragEvent): void => {
    if (this.props.imgSrc === undefined) {
      const types = event.dataTransfer.types;
      if (types.length === 1 && types[0] === 'Files') {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        if (!this.state.hover) { this.setState({ hover: true }); }
      }
    }
  }

  onDrop = (event: React.DragEvent): void => {
    if (this.state.hover) { this.setState({ hover: false }); }
    if (this.props.imgSrc === undefined) { this.props.onDrop(event, this.props.type); }
  }

  onDragLeave = (event: React.DragEvent): void => {
    if (this.state.hover) { this.setState({ hover: false }); }
  }

  onPreview = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && this.props.imgSrc) {
      this.setState({showPreview : true});
    }
  }

  onPreviewCancel = () => {
    this.setState({showPreview: false});
  }

  static contextType = LangContext;
}

function renderDeleteImageButton({ activate, activationCounter, reset, extra }: ConfirmElementArgs<[LangContainer['misc'], string, boolean]>): JSX.Element {
  const [ strings, text, disabled ] = extra;
  return (
    <div
      className={
        'game-image-split__buttons__remove-image' +
        ((activationCounter > 0) ? ' game-image-split__buttons__remove-image--active simple-vertical-shake' : '') +
        (disabled ? ' game-image-split__buttons__remove-image--disabled' : '')
      }
      title={formatString(strings.deleteAllBlankImages, text)}
      onClick={disabled ? activate : undefined}
      onMouseLeave={reset}>
      <OpenIcon icon='trash' />
    </div>
  );
}
