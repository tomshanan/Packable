import { trigger, transition, style, animate, keyframes } from '@angular/animations';

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

export const expandAndFadeTrigger = trigger('expandAndFadeTrigger', [
    transition(':enter', [
        animate('200ms', keyframes([
            style({ opacity: 0, width: '0px', height: '0px' , overflow: 'hidden'}),
            style({ width: '*', height: '*' }),
            style({ opacity: 1 })
        ])),
    ]),
    transition(':leave', [
        animate('200ms', keyframes([
            style({ opacity: 1, width: '*', height: '*' , overflow: 'hidden'}),
            style({ opacity: 0 }),
            style({ width: "0px", height: "0px" })
        ]))
    ])
])

