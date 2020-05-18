import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { computed, action, observable } from "mobx";
import classnames from "classnames";
import { GameCellDnd, GameCellDndMode, DropInfo } from "../game-cell-dnd";
import { CellMode, Letter, CellPosition, CellPositionType } from "../../types";
import "./game-cell-connected.scss";
import { invariant, cellPositionEquals } from "../../utils";

export interface GameCellConnectedProps {
    className?: string;
    position: CellPosition;
}

@external
@observer
export class GameCellConnected extends React.Component<GameCellConnectedProps> {
    @inject private game!: Game;

    @observable private dragging = false;

    @computed private get permanent(): boolean {
        if (this.props.position.positionType !== CellPositionType.BOARD) {
            return false;
        }
        if (this.letter === undefined) {
            return false;
        }
        return this.game.turn !== this.turn;
    }

    @computed private get markedForExchange() {
        return this.game.lettersToExchange?.some(exchange => cellPositionEquals(exchange, this.props.position));
    }

    @computed private get faded(): boolean {
        if (this.dragging) {
            return true;
        }

        if (this.props.position.positionType !== CellPositionType.STAND) {
            return false;
        }

        if (this.game.isPassing && !this.markedForExchange) {
            return true;
        }

        return false;
    }

    @computed private get letter(): Letter | undefined {
        return this.game.getLetter(this.props.position);
    }

    @computed private get turn(): number | undefined {
        return this.game.getCellTurn(this.props.position);
    }

    @computed private get classNames() {
        return classnames(
            {
                GameCellConnected: true,
                "GameCellConnected--faded": this.faded,
                "GameCellConnected--permanent": this.permanent,
                "GameCellConnected--passing": this.game.isPassing
            },
            this.props.className,
        );
    }

    @action.bound private handleDrop({ targetPosition, sourcePosition }: DropInfo): boolean {
        this.game.moveCell(sourcePosition, targetPosition);
        return true;
    }

    @action.bound private handleDragStart() {
        this.dragging = true;
    }

    @action.bound private handleDragStop() {
        this.dragging = false;
    }

    @action.bound private handleClick() {
        if (this.props.position.positionType !== CellPositionType.STAND || !this.game.isPassing) {
            return;
        }

        if (this.markedForExchange) {
            this.game.unmarkLetterForExchange(this.props.position);
            return;
        }

        this.game.markLetterForExchange(this.props.position);
    }

    @computed private get cellMode(): CellMode {
        const { position } = this.props;
        switch (position.positionType) {
            case CellPositionType.BOARD:
                return this.game.board.cellModeAt(position.position);
            case CellPositionType.STAND:
                return CellMode.STAND;
            default:
                invariant(position);
        }
    }

    @computed private get immovable() {
        if (this.permanent) {
            return true;
        }
        if (this.props.position.positionType === CellPositionType.STAND) {
            return false;
        }
        if (this.game.currentUserId !== this.game.users.ownUser.id) {
            return true;
        }
        return false;
    }

    public render(): JSX.Element {
        if (this.immovable || this.game.isPassing) {
            return (
                <GameCellDnd
                    letter={this.letter}
                    cellMode={this.cellMode}
                    className={this.classNames}
                    dragMode={GameCellDndMode.NONE}
                    onClick={this.handleClick}
                />
            );
        }
        if (this.letter === undefined) {
            return (
                <GameCellDnd
                    cellMode={this.cellMode}
                    className={this.classNames}
                    dragMode={GameCellDndMode.TARGET}
                    onDrop={this.handleDrop}
                    position={this.props.position}
                />
            );
        }
        return (
            <GameCellDnd
                letter={this.letter}
                cellMode={this.cellMode}
                className={this.classNames}
                dragMode={GameCellDndMode.SOURCE}
                onDragStart={this.handleDragStart}
                onDragStop={this.handleDragStop}
                position={this.props.position}
            />
        );
    }
}
