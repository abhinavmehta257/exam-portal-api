// Format 1 (MCQ)
format1 = {
    "question": "",
    "options": [
        "a",
        "b"
    ],
    "correct": "a"
}

// Format 2 (Unit Conversion)
format2 = {
    "question": "",
    "lhs": null,
    "lhsUnit": "tens",
    "rhs": 10,
    "rhsUnit": "ones"
}

// Format 3 (Addition,Subtraction)
format3 = {
    question: "",
    "up": "9,4_5.257",
    "down": "-7,279,_39",
    "equal": "2,156,01",
    "op": "+",
    "upCorrect": ['1'],
    "downCorrect": ['2'],
    "equalCorrect": ['1'],
}

format4 = {
    "equal": "1,485",
    "equation": [
        '',
        '+',
        '',
        '-',
        '10'
    ],
    "correct": [
        '10',
        '20',
    ]
}

format5 = {
    "question": "",
    "options": [
        '9x2',
        '8x1',
        '6x3'
    ],
    "lessThan": 10,
    "greaterThan": 10,
    "equalTo": 10,
    'lessThanAns': [
        '8x1'
    ],
    'greaterThanAns': [
        '8x1'
    ],
    'equalToAns': [
        '8x1'
    ],
}

format6 = {
    table: [
        ['Total', 'No', 'Amount'],
        [35, 7, null],
        [42, 2, null],
        [60, null, 20],
        [88, 2, null]
    ],
    ans: [
        5,
        21,
        3,
        44
    ]
}

format7 = {}

// TODO: Fix this
format8 = {
    table: [
        ['Dishes'],
        ['Material','Cup','Platter']
        ['plastic', 200, 500],
        ['clay', 400, 900],
        ['glass', 300, 500]
    ],
    graph: [
    ]
}

format9 = {
    scores: [
        8, 10, '...'
    ],
    fill: {
        '5': 5
    }
}

format10 = {
    question: "",
    points: [
        [4, 4],
        [0, 8],
        [8, 5]
    ],
    radius: 5
}

format11 = {

}

format12 = {
    numerator: null,
    denominator: 100,
    equal: '0.51',
    squareSize: 10,
    isSquare: false
}

format13 = {
    order:[
        '6.2','6.8'
    ],
    'correct':[
        '6.8',
        '6.2'
    ]
}

format14 = {
}


format15 = {
    a:84,
    b:17,
    aDigits:2,
    bDigits:2
}
