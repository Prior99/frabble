import * as React from "react";
import { invariant } from "../../utils";
import { GameCell } from "../game-cell";
import { omit } from "ramda";
import { GameCellDndBasicProps, GameCellDndMode } from "./game-cell-dnd-types";
import { GameCellDndSourceProps, GameCellDndSource } from "./game-cell-dnd-source";
import { GameCellDndTarget, GameCellDndTargetProps } from "./game-cell-dnd-target";

export type GameCellDndProps = GameCellDndBasicProps | GameCellDndTargetProps | GameCellDndSourceProps;

export function GameCellDnd(props: GameCellDndProps): JSX.Element {
    switch (props.dragMode) {
        case GameCellDndMode.NONE:
            return <GameCell {...omit(["dragMode"], props)} />;
        case GameCellDndMode.SOURCE:
            return <GameCellDndSource {...props} />;
        case GameCellDndMode.TARGET:
            return <GameCellDndTarget {...props} />;
        default:
            invariant(props);
    }
}
