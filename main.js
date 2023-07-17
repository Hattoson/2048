const WIDTH = 4 //ヨコのマス数
const HEIGHT = 4 //タテのマス数
const MAR = 4
const START_POS_X = 50
const START_POS_Y = 50
const CELL_SIZE = 120

//カラーコード(上から順に2,4,8,16...2048のカラーコードを格納)
COLOR_CODE = [
  '#fff4f9', //2
  '#ffd6ff', //4
  '#eaffd6', //8
  '#d6ffd6', //16
  '#d6ffea', //32
  '#d6ffff', //64
  '#d6eaff', //128
  '#d6d6ff', //256
  '#ead6ff', //512
  '#ffd6ff', //1024
  '#ffd700' //2048
]

const KEY_UP = 38
const KEY_DOWN = 40
const KEY_LEFT = 37
const KEY_RIGHT = 39
const KEY_R = 82 //リセット

//htmlからcanvas要素を取得
let canvas = document.getElementById('2048')
let context = canvas.getContext('2d')

let keycode = 0 //入力されたキーコード
let score = 0
let move_speed = 5

let field_info = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]
//一個前に戻る用のバッファ
let prefield_info = []
for (let i = 0; i < field_info.length; i++) {
  prefield_info[i] = field_info[i].slice()
}
let prefield_info_buf = []
for (let i = 0; i < field_info.length; i++) {
  prefield_info_buf[i] = field_info[i].slice()
}
let RESET_FLAG = false
let GAMEOVER_FLAG = false
let GAMECLEAR_FLAG = false
let KEY_DOWN_FLAG = false
let MOVE_FLAG = false

//ランダムな0のマス目に2or4を一つ生成(2=90%)
function GenNewCell () {
  let count = 0
  let rand_cell_index //セルを挿入する番号
  let rand_cell_num //2or4を判定するための乱数
  for (let i = 0; i < field_info.length; i++) {
    for (let j = 0; j < field_info[i].length; j++) {
      if (field_info[i][j] == 0) {
        count++
      }
    }
  }
  rand_cell_index = Math.floor(Math.random() * count) //0からcount-1までのランダムな整数を生成
  count = 0
  rand_cell_num = Math.floor(Math.random() * 10)
  for (let i = 0; i < field_info.length; i++) {
    for (let j = 0; j < field_info[i].length; j++) {
      if (field_info[i][j] == 0) {
        if (rand_cell_index == count) {
          if (rand_cell_num == 1) {
            field_info[i][j] = 2 //2**2
          } else {
            field_info[i][j] = 1 //2**1
          }
          return
        } else {
          count++
        }
      }
    }
  }
}

function MoveCell (keycode) {
  let count = 1 //マスを動かした回数をカウント
  let move_count = false //動いたかどうかをカウント
  if (keycode == KEY_DOWN) {
    while (count > 0) {
      //マスが動かせなくなったら処理を終了
      count = 0
      for (let i = field_info.length - 1; i > 0; i--) {
        for (let j = 0; j < field_info.length; j++) {
          if (field_info[i][j] == 0 && field_info[i - 1][j] != 0) {
            field_info[i][j] = field_info[i - 1][j]
            field_info[i - 1][j] = 0
            count++
          }
        }
      }

      if (move_count == false && count == 0) {
        //最初から一度も動いていない場合
        return false
      }
      move_count = true
    }
  }
  if (keycode == KEY_UP) {
    while (count > 0) {
      count = 0
      for (let i = 0; i < field_info.length - 1; i++) {
        for (let j = 0; j < field_info.length; j++) {
          if (field_info[i][j] == 0 && field_info[i + 1][j] != 0) {
            field_info[i][j] = field_info[i + 1][j]
            field_info[i + 1][j] = 0
            count++
          }
        }
      }
      if (move_count == false && count == 0) {
        //最初から一度も動いていない場合
        return false
      }
      move_count = true
    }
  }
  if (keycode == KEY_RIGHT) {
    while (count > 0) {
      count = 0
      for (let i = 0; i < field_info.length; i++) {
        for (let j = field_info.length - 1; j > 0; j--) {
          if (field_info[i][j] == 0 && field_info[i][j - 1] != 0) {
            field_info[i][j] = field_info[i][j - 1]
            field_info[i][j - 1] = 0
            count++
          }
        }
      }
      if (move_count == false && count == 0) {
        //最初から一度も動いていない場合
        return false
      }
      move_count = true
    }
  }
  if (keycode == KEY_LEFT) {
    while (count > 0) {
      count = 0
      for (let i = 0; i < field_info.length; i++) {
        for (let j = 0; j < field_info.length - 1; j++) {
          if (field_info[i][j] == 0 && field_info[i][j + 1] != 0) {
            field_info[i][j] = field_info[i][j + 1]
            field_info[i][j + 1] = 0
            count++
          }
        }
      }

      if (move_count == false && count == 0) {
        //最初から一度も動いていない場合
        return false
      }
      move_count = true
    }
  }
  return true
}

function StackingCell (keycode) {
  if (keycode == KEY_DOWN) {
    for (let i = field_info.length - 1; i > 0; i--) {
      for (let j = 0; j < field_info.length; j++) {
        if (field_info[i][j] == field_info[i - 1][j] && field_info[i][j] != 0) {
          field_info[i][j]++
          field_info[i - 1][j] = 0
          score += 2 ** field_info[i][j]
          MOVE_FLAG = true
          if(field_info[i][j] == 11){
            GAMECLEAR_FLAG = true
          }
        }
      }
    }
  }
  if (keycode == KEY_UP) {
    for (let i = 0; i < field_info.length - 1; i++) {
      for (let j = 0; j < field_info.length; j++) {
        if (field_info[i][j] == field_info[i + 1][j] && field_info[i][j] != 0) {
          field_info[i][j]++
          field_info[i + 1][j] = 0
          score += 2 ** field_info[i][j]
          MOVE_FLAG = true
          if(field_info[i][j] == 11){
            GAMECLEAR_FLAG = true
          }
        }
      }
    }
  }
  if (keycode == KEY_RIGHT) {
    for (let i = 0; i < field_info.length; i++) {
      for (let j = field_info.length - 1; j > 0; j--) {
        if (field_info[i][j] == field_info[i][j - 1] && field_info[i][j] != 0) {
          field_info[i][j]++
          field_info[i][j - 1] = 0
          score += 2 ** field_info[i][j]
          MOVE_FLAG = true
          if(field_info[i][j] == 11){
            GAMECLEAR_FLAG = true
          }
        }
      }
    }
  }
  if (keycode == KEY_LEFT) {
    for (let i = 0; i < field_info.length; i++) {
      for (let j = 0; j < field_info.length - 1; j++) {
        if (field_info[i][j] == field_info[i][j + 1] && field_info[i][j] != 0) {
          field_info[i][j]++
          field_info[i][j + 1] = 0
          score += 2 ** field_info[i][j]
          MOVE_FLAG = true
          if(field_info[i][j] == 11){
            GAMECLEAR_FLAG = true
          }
        }
      }
    }
  }
}

//リセット関数
function AllReset () {
  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {
      field_info[i][j] = 0
    }
  }
  for (let i = 0; i < field_info.length; i++) {
    prefield_info[i] = field_info[i].slice()
  }
  score = 0
  GenNewCell()
  GenNewCell()
  for (let i = 0; i < field_info.length; i++) {
    prefield_info[i] = field_info[i].slice()
  }
  ClearField()
  DrawField()
  DrawCell()
}

//一つ前の盤面に戻る
function UndoOnce () {
  if (field_info != prefield_info) {
    for (let i = 0; i < field_info.length; i++) {
      field_info[i] = prefield_info[i].slice()
    }
  }
  ClearField()
  DrawField()
  DrawCell()
}

//フィールドの描画
function DrawField () {
  context.lineWidth = 8
  context.strokeStyle = '#696969';
  context.fillStyle = '#ffffe0'
  context.fillRect(START_POS_X, START_POS_Y, CELL_SIZE * WIDTH, CELL_SIZE * HEIGHT)
  context.rect(START_POS_X, START_POS_Y, CELL_SIZE * WIDTH, CELL_SIZE * HEIGHT)
  context.stroke()

  //
  for (let i = 0; i < HEIGHT - 1; i++) {
    context.beginPath()
    context.moveTo(START_POS_X, START_POS_Y + CELL_SIZE * (1 + i))
    context.lineTo(
      START_POS_X + CELL_SIZE * WIDTH,
      START_POS_Y + CELL_SIZE * (1 + i)
    )
    context.stroke()
  }
  for (let i = 0; i < WIDTH - 1; i++) {
    context.beginPath()
    context.moveTo(START_POS_X + CELL_SIZE * (1 + i), START_POS_Y)
    context.lineTo(
      START_POS_X + CELL_SIZE * (1 + i),
      START_POS_Y + CELL_SIZE * HEIGHT
    )
    context.stroke()
  }
  context.textAlign = 'center'
  context.fillStyle = '#000000'
  context.font = '40px Franklin Gothic'
  context.fillText(
    'SCORE:     '+score,
    START_POS_X + CELL_SIZE * (WIDTH - 1) + 20,
    START_POS_Y + CELL_SIZE * HEIGHT + 40
  )
  
  if(GAMECLEAR_FLAG == true){
    context.fillStyle = 'red'
    context.fillText(
      'GAMECLEAR!!',
      START_POS_X + CELL_SIZE,
      START_POS_Y + CELL_SIZE * HEIGHT + 40
    )
  }
}
function ClearField () {
  context.clearRect(0, 0, 600, 600) //全画面クリア
}
//セルの描画(枠線と被らないようにマージン処理)
function DrawCell () {
  let tmp_cell_num = 0 //一次的に捜査中のセルの数値を格納
  let cell_color
  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {
      tmp_cell_num = field_info[i][j]
      cell_color = COLOR_CODE[tmp_cell_num - 1]
      if (tmp_cell_num != 0) {
        //空白の時は描画をしない
        context.fillStyle = cell_color
        context.fillRect(
          START_POS_X + MAR + CELL_SIZE * j,
          START_POS_Y + MAR + CELL_SIZE * i,
          CELL_SIZE - MAR * 2,
          CELL_SIZE - MAR * 2
        )
        context.font = '70px Franklin Gothic'
        context.fillStyle = '#333333'
        context.fillText(
          2 ** tmp_cell_num,
          START_POS_X + CELL_SIZE * j + CELL_SIZE / 2,
          START_POS_Y + MAR + CELL_SIZE * i + CELL_SIZE / 2 + 20
        )
      }
    }
  }
}



//メイン処理
function main () {

  //キーボードイベント監視
  const inputkey = document
  inputkey.addEventListener('keydown', handleKeyDown)


  //初期化処理
  GenNewCell()
  GenNewCell()
  for (let i = 0; i < field_info.length; i++) {
    prefield_info[i] = field_info[i].slice()
  }
  ClearField()
  DrawField()
  DrawCell()

  console.log(    START_POS_X + CELL_SIZE * (WIDTH - 2) + 10,
  START_POS_Y + CELL_SIZE * HEIGHT + 40)
  //キーが押された時の処理
  function handleKeyDown (event) {
    //矢印キーのデフォルト入力を無効化（画面スクロール)
    keycode = event.keyCode
    if ([37, 38, 39, 40].includes(event.keyCode)) {
      event.preventDefault()
    }
    if (
      keycode == KEY_DOWN ||
      keycode == KEY_UP ||
      keycode == KEY_LEFT ||
      keycode == KEY_RIGHT
    ) {
      KEY_DOWN_FLAG = true
    }
    if (KEY_DOWN_FLAG == true) {
      for (let i = 0; i < field_info.length; i++) {
        prefield_info_buf[i] = field_info[i].slice()
      }
      MOVE_FLAG = MoveCell(keycode)
      StackingCell(keycode)
      MoveCell(keycode)
      if (MOVE_FLAG == true) {
        GenNewCell()
        for (let i = 0; i < field_info.length; i++) {
          prefield_info[i] = prefield_info_buf[i].slice()
        }
      }
    }
    //フラグのリセット等
    KEY_DOWN_FLAG = false
    MOVE_FLAG = false
    ClearField()
    DrawField()
    DrawCell()
  }
}

main()
