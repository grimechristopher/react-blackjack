import {useEffect, useState} from 'react';
import styles from './Game.module.css'

const Game = () => {

    const [playingDeck, setPlayingDeck] = useState([]);
    const [hands, setHands] = useState([]);
    const [dealer, setDealer] = useState([]);
    const [activeHand, setActiveHand] = useState(0);
    const [sums, setSums] = useState(0);
    const [handsWon, setHandsWon] = useState(0);
    const [handsLost, setHandsLost] = useState(0); 
    const [handsSplit, setHandsSplit] = useState(0);

    const [game, setGame] = useState({
        deckAmt: 1,
        playerAmt: 1,
        activeDeck: [],
        activeHand: 0,
        state: 'prestart',
    })

    const [user, setUser] = useState({
        wins: 0,
        losses: 0,
        splits: 0,
        seat: 0
    })

    const [players, setPlayers] = useState([]);
    /*
        object Player = {
            hand: [],
            sum: 0,
            ai: 0
        }
    */

    // Users are able to type numbers outside the allowed range. 
    // If a number outside the range is entered then change it to be inside range
    function handleGameChange(e) {
        console.log(e.target.name);
        const max_decks = 8;
        const max_players = 7;
        // Handle Minimum
        if (e.target.value < 1) {
            e.target.value = 1;
        }
        // Handle Maximums
        if (e.target.name === 'deckAmt' && e.target.value > max_decks) {
            e.target.value = max_decks;
        }
        if (e.target.name === 'playerAmt' && e.target.value > max_players) {
            e.target.value = max_players;
        }
        setGame({
            ...game,
            [e.target.name]: e.target.value
        });
    }

    function handleUserChange(e) {
        setUser({
            ...user,
            [e.target.name]: e.target.dataset.number
        });
    }

    // Create the Deck that will be played with
    function createDeck() {
        console.log("Creating Deck");
        let suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
        let deck = [];

        for (let decks = 0; decks < game.deckAmt; decks++ ) { // Create a deck of playing cards for each deck being used
            for (let i = 0; i < suits.length; i++) { // Each deck has 4 Suits
                for (let j = 1; j <= 13; j++) { // Each suit has 13 Cards.
                    // Modify cards with non-numeral faces and adjust values to Blackjack values
                    let face = j, value = j;
                    if (j ==  1) { value = 11; face = 'A';}
                    if (j ==  11) { value = 10; face = 'J'; }
                    if (j ==  12) { value = 10; face = 'Q'; }
                    if (j ==  13) { value = 10; face = 'K'; }
                    let card = {
                        suit: suits[i],
                        value: value,
                        face: face,
                    }
                    deck.push(card); // Card is made and corrected -> push to deck variable
                }
            }
        }

        // Goal is to have a shuffle that simulates hand shuffling the cards
        // Right now I am okay with a simple shuffle
        let card;
        let temp;
        //let deck = playingDeck; <-- incorrect way to copy state
        //let deck = [...playingDeck]; // State
        for (let i = 0 ; i < deck.length; i++) {
            card = Math.floor(Math.random() * i);
            temp = deck[i];
            deck[i] = deck[card];
            deck[card] = temp;
        }
        setPlayingDeck(deck); // update the State
        setGame({
            ...game,
            playingDeck: deck
        })
    }

    function createHands() {
        let temps = [];
        let s = [];

        for (let i = 0; i < game.playerAmt; i ++) {
            let temp = [];
            temps.push(temp);
            s.push(0);
        }
        s.push(0); // The Dealers Sum

        setHands(temps)
        setSums(s);

    }

    function initialDeal() {
        let temps = [...hands];
        let dlr = [...dealer];
        let sms = [...sums];
        //playingDeck.pop(); <-- Wrong way to pop a React State
        //const deck = playingDeck; <-- incorrect way to copy State
        const deck = [...playingDeck];
        // deal 2 cards to each player and to the dealer
        for (let c = 0; c < 2; c++) {
            for (let i = 0; i < hands.length; i++) {
                if (playingDeck.length > 0) {
                    let card = deck.pop();
                    //console.log(card);
                    temps[i].push(card);
                    sms[i] += card.value;
                    // Check for 2 aces
                    if (sms[i] === 22) {
                        sms[i] = 12;
                    }  
                }
                else {
                    console.log("Deck is empty");
                }
            }
            // Deal to the dealer
            let card = deck.pop();
            dlr.push(card);
            sms[sms.length-1] += card.value;
        }
        setPlayingDeck(deck)
         if (user.seat === game.activeHand) {
            setGame({
                ...game,
                state: "playing",
                activeDeck: deck
            })
         }
         else {
            setGame({
                ...game,
                state: "before turn",
                activeDeck: deck
            })
         }

        setHands(temps);
        setDealer(dlr);
        setSums(sms);
        
    }

    function play() {
        let turn = game.activeHand;
        if (sums[turn] <= 14) {
            hit();
        }
        else {
            stand();
        }

        setGame({
            ...game,
            activeHand: turn + 1
        })

    }

    function playDealer() {
        let sms = [...sums];
        console.log(sms[sms.length - 1]);
        while (sms[sms.length-1] < 17) 
        {
            let dlr = [...dealer];
            //let sms = [...sums];

            let deck = game.activeDeck;
            //let hand = sms.length
    
            if (playingDeck.length > 0) {
                let card = deck.pop();
                dlr.push(card);
                sms[sms.length - 1] += card.value;
                console.log(dlr);
            }

            setGame({
                ...game,
                activeDeck: deck,
            })
            setDealer(dlr);
            setSums(sms);

        }
            // Game Over
            //handleGameOver();
            setGame({
                ...game,
                state: "over"
            })
        
    }

    function hit() {
        console.log(game.activeHand);
        let hnds = [...hands];
        let sms = [...sums];

        let deck = game.activeDeck;
        let hand = game.activeHand;

        if (playingDeck.length > 0) {
            let card = deck.pop();
            hnds[hand].push(card);
            sms[hand] += card.value;
            if (Object.values(hnds[hand].includes('A'))) {
                console.log("Found Ace in Hand " + hand);
                sms[hand] = calculateAces(hnds[hand]);
            }
        }


        setGame({
            ...game,
            activeDeck: deck,
        })
        setHands(hnds);
        setSums(sms);

        if (sms[hand] === 21) {
            stand();
        }

        if (sms[hand] > 21) {
            stand();
        }

        //play();
    }

    function stand() {
        let num = game.activeHand + 1;
        if (num >= game.playerAmt) {
            setGame({
                ...game,
                state: "over"
            })
        }
        //setActiveHand(num);
        setGame({
            ...game,
            activeHand: num
        })
        //play();
    }

    function calculateAces(curHand) {
        console.log("Calculating Aces")
        let numAces = 0;
        let sum = 0;

        for (let i = 0; i < curHand.length; i++) {
            sum += curHand[i].value;
            if (curHand[i].face === 'A') {
                numAces += 1;
            }
        }

        console.log("Found " + numAces + " Aces" + " Sum = " + sum);

        // return highest sum without going over 21

        while (numAces > 0 && sum > 21) {
            sum -= 10;
            numAces -= 1;
        }

        return sum;

    }

    function handleGameOver() {
        let wins = handsWon;
        let losses = handsLost;
        let split = handsSplit;

        let userScore = sums[user.seat];
        console.log(userScore);
        let highestOp = 0;
        
        if (userScore > 21) {
            userScore = 0;
        } 
        //console.log(sums);
        for (let i = 0; i < sums.length; i++) {
            if (i !== user.seat && sums[i] <= 21 && sums[i] > highestOp) {
                highestOp = sums[i];    
                console.log(highestOp);
            }
        }

        if (highestOp > userScore) {
            losses += 1;
            setHandsLost(losses);
        } 
        if (highestOp === userScore) {
            split += 1;
            setHandsSplit(split);
        }
        if (highestOp < userScore) {
            wins += 1;
            setHandsWon(wins);
        }

        setGame({
            ...game,
            state: "over"
        })

    }

    function resetGame() {
        createDeck();
        createHands();
        setDealer([]);
        setActiveHand(0);
        setGame({
            ...game,
            state: "prestart",
            activeHand: 0,
        })

    }

    useEffect(() => {
        resetGame();
        console.log("Game Changed");
    }, [game.deckAmt, game.playerAmt]);

    useEffect(() => {
        console.log(playingDeck);
    }, [playingDeck]);

    useEffect(() => {
        console.log(hands);
    }, [hands]);

    useEffect(() => {
        if (game.state === "before turn" || game.state === "after turn" ) {
            console.log("CPU Turn");
            play();
        }
        if (game.state === "playing") {
            console.log("Your Turn");
        }
        if (game.state === "dealers turn") {
            console.log("dealers Turn");
            playDealer();
        }

        if (game.state === "over") {
            console.log("gameover");
            handleGameOver();
        }
    }, [sums, game.state]);

    useEffect(() => {
        if (game.activeHand < user.seat) {
            setGame({
                ...game,
                state: "before turn"
            })
        }
        if (game.activeHand === user.seat && game.state !== "prestart") {
            setGame({
                ...game,
                state: "playing"
            })
        }
        if (game.activeHand > user.seat) {
            setGame({
                ...game,
                state: "after turn"
            })
        }
        if (game.activeHand >= hands.length && game.activeHand != 0) {
            setGame({
                ...game,
                state: "dealers turn"
            })
        }
        //console.log();
    }, [game.activeHand]);

    
    // Clean Up the JSX by breaking it up
    function userInfo() {
        return (
            <div>
                <h4>Wins/Losses/Splits: {handsWon}/{handsLost}/{handsSplit}</h4>
                {handsWon > 0 && <h4>Win Rate: {(handsWon/(handsWon + handsLost + handsSplit)*100).toFixed(2)}%</h4>}
            </div>
        )
    }

    function gameSettings() {
        return (
            <div>
                <div className={styles.inputRow}>
                    <label>Number of decks to use: </label>
                    <input 
                        type="number"
                        name="deckAmt"
                        onChange={handleGameChange}
                        value={game.deckAmt}
                        min="1"
                        max="8"
                    />
                </div>
                <div className={styles.inputRow}>
                    <label>Players:</label>
                    <input 
                        type="number"
                        name="playerAmt"
                        onChange={handleGameChange}
                        value={game.playerAmt}
                        min="1"
                        max="7"
                    />
                </div>
            </div>
        )
    }

    function actions() {
        return (
            <div>
                { game.state === "prestart" &&
                    <button
                        onClick={initialDeal}
                    >Start</button>
                }
                { game.state === "playing" &&
                <div>
                    <button
                        onClick={hit}
                    >Hit</button>
                    <button
                        onClick={stand}
                    >Stand</button>
                </div>
                }
                { game.state === "before turn" &&
                <div>
                    <button
                        onClick={play}
                    >Cycle</button>
                </div>
                }
                { game.state === "over" &&
                    <button
                        onClick={resetGame}
                    >Start Over</button>
                }
            </div>
        )
    }

    function displayHands() {
        return (
            <div>
                <div>
                    <h3>Dealer</h3>
                    <div className={styles.dealersHand}>
                    {
                    dealer.map((card, i) => (
                        <div className={styles.playingCard} >
                            <h4>{card.suit} {card.face}</h4>
                        </div>
                    ))
                    }
                    </div>

                    <h4>{sums[sums.length-1]}{sums[sums.length-1] > 21 && <span> Bust</span>}{sums[sums.length-1] == 21 && <span> Blackjack</span>}</h4>
                </div>
                <div className={styles.playersContainer}>
                    { hands.map((hand, i) => (
                    <div>
                        { user.seat == i &&
                            <h3>You</h3>
                        }
                        { user.seat != i &&
                            <div>
                                <h3>Player {i + 1}</h3>
                            </div>
                        }
                        <div className={styles.handContainer}>
                            {
                                hand.map((card, j) => (
                                <div className={styles.playingCard}>
                                    <h4>{card.suit} {card.face}</h4>
                                </div>
                                ))
                            }
                        </div>  
                        <h4>{sums[i]}{sums[i] > 21 && <span> Bust</span>}{sums[i] == 21 && <span> Blackjack</span>}</h4>                  
                    </div>    

                    ))}                    
                </div>

            </div>
        )
    }

    return (
        <div className={styles.gameContainer}>
            <h1>Blackjack</h1>
            {userInfo()}
            {gameSettings()}
            {actions()}
            <div className={styles.dealersHand}>
                <div className={styles.playingCard}>
                    <h4>Deck: {playingDeck.length}</h4>
                </div>
            </div>
            {displayHands()}
        </div>
    );
};

export default Game;