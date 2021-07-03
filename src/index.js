import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const ROW_NUM = 3;
const COL_NUM = 3;
const MAX_SQUARES = ROW_NUM * COL_NUM;

function Square (props){
    return (
      <button className={props.highlightWinner}
        onClick={() => props.onClick() }>
        {props.value}
      </button>
    );
}

class Board extends React.Component {

  renderSquare(i) {
    let highlightWinnerClass = 'square';

    /* If a player has already won and the current square is one of the winning squares, then
    highlight that square. */
    if (this.props.winnerCells && this.props.winnerCells.indexOf(i) > -1) {
      highlightWinnerClass = 'square highlighted';
    }

    return (
       <Square
          value={this.props.squares[i]} 
          highlightWinner = {highlightWinnerClass} // Adds a new class to determine a winning square
          onClick={() => this.props.onClick(i)}
       />
    );
  }

  render() {
   
    let allSquares = []

    for (var rowCount = 0; rowCount < ROW_NUM; rowCount ++) {
      let rowSquares = []
      for (var colCount = 0; colCount < COL_NUM; colCount ++) {
        rowSquares.push(this.renderSquare((rowCount * ROW_NUM) + colCount));
      }

      // Adds a whole new row for all the squares in a column.
      allSquares.push(<div className="board-row">{rowSquares}</div>)
    }

    return (
      <div>
        {allSquares}
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
       history: [{
         squares: Array(9).fill(null),
         picked: null,
       }],
       stepNumber: 0,
       xIsNext: true,
       movesAsc: true,
    };
  }

  handleClick(i) {

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    // If the game already has a winner, then ignore all future clicks.
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        picked: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleOrder() {
    this.setState({ movesAsc: !this.state.movesAsc});
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares); // Grabs squares[a] and each individual squares a, b, and c
    const winner = winnerInfo ? winnerInfo[0] : winnerInfo; // Gets squares[a] if there's a winner
    const winnerCells = winnerInfo ? winnerInfo.slice(1) : winnerInfo; // Grabs individual squares a, b, and c, otherwise returns null

    // Bolds the current step move, otherwise displays non-bold move.
    let moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' - ' + (step.picked%ROW_NUM+1) + ',' + (Math.floor(step.picked/COL_NUM)+1) :
        'Go to game start';
        return (
           <li key={move}>
              <button onClick={() => this.jumpTo(move)}>
                {this.state.stepNumber === move ? <b>{desc}</b> : desc}
              </button>
          </li>
        );
    });

    if (this.state.movesAsc === false) {
      moves = moves.reverse();
    }

    let status;
    if (winner) {
      if (winner === 'draw') {
        status = 'The match is a draw.';
      }
      else {
        status = 'Winner: ' + winner;
      }
    } 
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    
    const oppOrder = this.state.movesAsc ? 'descending' : 'ascending';
    let toggleButton = <button onClick={ () => this.toggleOrder() }>Toggle move order to {oppOrder}</button>

    return (
      <div className="game">
        <div className="game-board">
          <Board
             squares={current.squares}
             winnerCells={winnerCells} // Highlights all winning squares
             onClick = {(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{toggleButton}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], a, b, c];
    }
  }

  // Checks if each square is null. If one or more are, then the game board is not all filled up yet.
  for (let i = 0; i < MAX_SQUARES; i++){
    if(squares[i] === null) {
      return null;
    }
  }

  // All the squares are filled up.
  return ['draw', null];
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
