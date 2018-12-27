import { trigger, transition, style, animate, keyframes, state } from '@angular/animations';

export const dropInTrigger =
    trigger('dropInTrigger', [
        transition(':enter', [
            animate('200ms', keyframes([
                style({ opacity: 0, height: '0px', transform: "translateY(-20px)" }),
                style({ opacity: 1, transform: "translateY(0px)", height: '*' }),
            ])),
        ]),
        transition(':leave', [
            animate('200ms', keyframes([
                style({ opacity: 1, height: '*', transform: "translateY(0px)" }),
                style({ opacity: 0, transform: "translateY(-20px)", height: "0px" }),
            ]))
        ])
    ])
    export const addRemoveElementTrigger =
    trigger('addRemoveElementTrigger', [
        transition(':enter', [
            style({ opacity: 0, height: '0px', transform: "translateY(-20px)" }),
            animate('200ms 200ms', keyframes([
                style({ opacity: 1, transform: "translateY(0px)", height: '*' }),
            ])),
        ]),
        transition(':leave', [
            style({ opacity: 1, height: '*', transform: "translateY(0px)" }),
            animate('200ms 200ms', keyframes([
                style({ opacity: 0, transform: "translateY(-20px)", height: "0px" }),
            ]))
        ])
    ])
export const expandAndFadeTrigger = trigger('expandAndFadeTrigger', [
    transition(':enter', [
        animate('200ms', keyframes([
            style({ opacity: 0, width: '0px', height: '0px'}),
            style({ width: '*', height: '*' }),
            style({ opacity: 1 })
        ])),
    ]),
    transition(':leave', [
        animate('200ms', keyframes([
            style({ opacity: 1, width: '*', height: '*'}),
            style({ opacity: 0 }),
            style({ width: "0px", height: "0px" })
        ]))
    ])
])

export const transitionTrigger = trigger('transitionTrigger', [
    transition(':enter', [
        style({ opacity: 0, height: '0px'}),
        animate('300ms 150ms', keyframes([
            style({ opacity: 0, height: '0px', offset: 0}),
            style({ height: '*', offset: 0.5}),
            style({ opacity: 1, offset: 1}),
        ])),
    ]),
    transition(':leave' , [
        style({ opacity: 1, height: '*'}),
        animate('300ms', keyframes([
            style({ opacity: 1, height: '*', offset: 0}),
            style({ opacity: 0, offset: 0.5}),
            style({ height: '0px', offset: 1}),
        ])),
    ])
])

export const quickTransitionTrigger = trigger('quickTransitionTrigger', [
    transition(':enter', [
        style({ opacity: 0, height: '0px'}),
        animate('200ms 100ms', keyframes([
            style({ opacity: 0, height: '0px', offset: 0}),
            style({ height: '*', offset: 0.5}),
            style({ opacity: 1, offset: 1}),
        ])),
    ]),
    transition(':leave' , [
        style({ opacity: 1, height: '*'}),
        animate('200ms', keyframes([
            style({ opacity: 1, height: '*', offset: 0}),
            style({ opacity: 0, offset: 0.5}),
            style({ height: '0px', offset: 1}),
        ])),
    ])
])

export const evaporateTransitionTrigger = trigger('evaporateTransitionTrigger', [
    transition(':enter', [
        style({ opacity: 0, height: '0px'}),
        animate('300ms 150ms', keyframes([
            style({ opacity: 0, height: '0px', offset: 0}),
            style({ height: '*', offset: 0.5}),
            style({ opacity: 1, offset: 1}),
        ])),
    ]),
    transition(':leave' , [
        style({ opacity: 1, height: '*', overflow: 'visible'}),
        animate('300ms', keyframes([
            style({ opacity: 1, height: '*',offset: 0}),
            style({ opacity: 0, height: '0px',transform: 'translateY(-60px)',offset: 1}),
        ])),
    ])
])