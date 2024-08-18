var MQ = MathQuill.getInterface(2);
var mathField;

document.addEventListener('DOMContentLoaded', function() {
    var mathFieldSpan = document.getElementById('math-field');
    mathField = MQ.MathField(mathFieldSpan, {
        spaceBehavesLikeTab: true,
        handlers: {
            edit: function() {
                plotGraph(); // 数式が変更されるたびにグラフを更新
            }
        }
    });

    // 初期数式を設定
    mathField.latex('x^2');
    plotGraph(); // 初期グラフを描画
});

function plotGraph() {
    const equation = mathField.latex(); // LaTeX形式で数式を取得
    const graphDiv = document.getElementById('graph');

    // 現在のx軸の範囲を取得
    const xRange = graphDiv.layout.xaxis.range || [-10, 10]; // デフォルト範囲
    const xMin = xRange[0];
    const xMax = xRange[1];

    const xValues = [];
    const yValues = [];

    try {
        // xの範囲を無限にするため、適切なステップで値を生成
        for (let x = xMin; x <= xMax; x += 0.1) {
            xValues.push(x);
            yValues.push(math.evaluate(equation.replace(/\\frac{(.+?)}{(.+?)}/g, '($1)/($2)').replace(/\\sqrt{(.+?)}/g, 'sqrt($1)'), { x: x }));
        }

        const data = [{
            x: xValues,
            y: yValues,
            type: 'scatter'
        }];

        Plotly.react('graph', data); // グラフを更新
    } catch (error) {
        document.getElementById('error-message').textContent = '数式の入力が正しくありません: ' + error.message;
    }
}

// ズームイベントをリッスンして範囲を更新
document.getElementById('graph').on('plotly_relayout', function(eventData) {
    const xRange = eventData['xaxis.range'];
    const yRange = eventData['yaxis.range']; // y軸の範囲も取得

    if (xRange) {
        updateGraphWithNewRange(xRange); // 新しい範囲を渡す
    }
});

function updateGraphWithNewRange(xRange) {
    const equation = mathField.latex(); // LaTeX形式で数式を取得
    const xValues = [];
    const yValues = [];

    // 新しい範囲に基づいてxの値を生成
    for (let x = xRange[0]; x <= xRange[1]; x += 0.1) {
        xValues.push(x);
        // 評価時にxの値を渡す
        yValues.push(math.evaluate(equation.replace(/\\frac{(.+?)}{(.+?)}/g, '($1)/($2)').replace(/\\sqrt{(.+?)}/g, 'sqrt($1)'), { x: x }));
    }

    const data = [{
        x: xValues,
        y: yValues,
        type: 'scatter'
    }];

    Plotly.react('graph', data); // グラフを更新
}