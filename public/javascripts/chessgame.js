const socket=io();
const chess=new Chess();
const BoardElement =document.querySelector(".chessboard");
const roleBadge = document.getElementById("role-badge");
const turnIndicator = document.getElementById("turn-indicator");
const gameAlert = document.getElementById("game-alert");
const moveHistoryEl = document.getElementById("move-history");

let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;
let moveCount = 1;

const updateGameStatus = function() {
    // Turn Indicator
    const turnColor = chess.turn(); // 'w' or 'b'
    if (turnColor === 'w') {
        turnIndicator.innerHTML = '<div class="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>White';
    } else {
        turnIndicator.innerHTML = '<div class="w-3 h-3 rounded-full bg-zinc-900 border border-zinc-500 shadow-[0_0_10px_rgba(0,0,0,0.8)]"></div>Black';
    }

    // Game Over states
    if (chess.in_checkmate()) {
        const winner = chess.turn() === 'w' ? 'Black' : 'White';
        showGameAlert(`Checkmate! ${winner} wins!`, 'bg-red-500/20 text-red-400 border-red-500/50');
    } else if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) {
        showGameAlert('Game Over: Draw', 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50');
    } else if (chess.in_check()) {
        showGameAlert('Check!', 'bg-orange-500/20 text-orange-400 border-orange-500/50');
    } else {
        gameAlert.classList.add('hidden');
    }
}

const showGameAlert = function(message, classes) {
    gameAlert.className = `text-center p-3 rounded-lg font-bold text-sm border ${classes}`;
    gameAlert.innerText = message;
    gameAlert.classList.remove('hidden');
}

const renderBoard=function(){
    const board=chess.board();
    BoardElement.innerHTML="";
    board.forEach(function(row,rowindex){
        row.forEach(function(square,squareindex){
            const squareElement=document.createElement("div");
            squareElement.classList.add("square",
                (rowindex+squareindex)%2===0? "light":"dark"
            );
            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;

            if(square){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add("piece",
                    square.color==="w" ?"white":"black");
                pieceElement.innerText =getPieceUnicode(square);
                pieceElement.draggable=playerRole===square.color;
                pieceElement.addEventListener("dragstart",function(e){
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare={row:rowindex,col:squareindex};
                        e.dataTransfer.setData("text/plain","");
                        
                    }
                });
                pieceElement.addEventListener("dragend",function(e){
                    draggedPiece=null;
                    sourceSquare=null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
            });
            squareElement.addEventListener("drop",function(e){
                e.preventDefault();
                if(draggedPiece){
                    const target={
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare,target);
                };
            });
            BoardElement.appendChild(squareElement);
        })
    });

    if(playerRole==="b"){
        BoardElement.classList.add("flipped");
    }else{
        BoardElement.classList.remove("flipped");
    }
}
const handleMove=function(sourceSquare,target){
    const move={
        from:`${String.fromCharCode(97+sourceSquare.col)}${8-sourceSquare.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:"q",

    };
    socket.emit("move",move);

}
const getPieceUnicode = function (piece) {
    const unicodePieces = {
        w: {
            k: "♔",
            q: "♕",
            r: "♖",
            b: "♗",
            n: "♘",
            p: "♙",
        },
        b: {
            k: "♚",
            q: "♛",
            r: "♜",
            b: "♝",
            n: "♞",
            p: "♟",
        },
    };

    return unicodePieces[piece.color][piece.type];
};

const updateRoleBadge = function(role, desc, colorClass) {
    roleBadge.className = `px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase border shadow-inner ${colorClass}`;
    roleBadge.innerText = desc;
}

socket.on("playerRole",function(role){
    playerRole=role;
    if (role === 'w') updateRoleBadge('w', 'Playing White', 'border-zinc-300 bg-zinc-200 text-zinc-900 shadow-[0_0_15px_rgba(255,255,255,0.2)]');
    else if (role === 'b') updateRoleBadge('b', 'Playing Black', 'border-zinc-700 bg-zinc-900 text-zinc-100 shadow-[0_0_15px_rgba(0,0,0,0.5)]');
    renderBoard();
})
socket.on("spectatorRole",function(){
    playerRole=null;
    updateRoleBadge(null, 'Spectating', 'border-blue-500/50 bg-blue-500/10 text-blue-400');
    renderBoard();
})
socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
    updateGameStatus();
})

socket.on("move",function(move){
    chess.move(move);
    renderBoard();
    updateGameStatus();
    
    // Update Move History
    if (moveCount === 1) moveHistoryEl.innerHTML = ''; // clear placeholder
    
    const moveHistoryItem = document.createElement("div");
    moveHistoryItem.className = "flex justify-between items-center py-2 border-b border-zinc-800/50 hover:bg-zinc-800/30 px-2 rounded transition-colors";
    
    // We get FEN from move, but simply displaying move from/to is sufficient
    // Using simple format like "Move 1: e2 -> e4"
    moveHistoryItem.innerHTML = `
        <span class="text-zinc-500 w-6">${moveCount}.</span>
        <span class="font-mono bg-zinc-900/50 px-2 py-0.5 rounded text-blue-400">${move.from}</span>
        <span class="text-zinc-600">→</span>
        <span class="font-mono bg-zinc-900/50 px-2 py-0.5 rounded text-emerald-400">${move.to}</span>
    `;
    
    moveHistoryEl.appendChild(moveHistoryItem);
    moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
    moveCount++;
})


renderBoard();
