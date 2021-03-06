/* 
TALK TO ME - ECAL 2022 - AB.
Serial communication via Web USB
Manage sending and receiving commands from serial
contains helper functions
public functions must be exposed in the return function
*/

let talkCommands = (function () {
  const colorLeds = {
    black: '00',
    white: '01',
    red: '02',
    green: '03',
    blue: '04',
    magenta: '05',
    yellow: '06',
    cyan: '07',
    orange: '08',
    purple: '09',
    pink: '10',
  };

  /* PRIVATE MEMBERS */
  function commandInterpretter(data) {
    const command = data.substring(0, 1);
    const val = data.substring(1);

    if (command == 'M') {
      // message
      talkFancylogger.logMessage(val);
      //appendLine('receiver_lines', 'Message: ' + val);
    }
    if (command == 'B') {
      // Button pressed
      dispatchButton(val, 'pressed');
      //appendLine('receiver_lines', 'Button: ' + val);
    }
    if (command == 'H') {
      // Button released
      dispatchButton(val, 'released');
      //appendLine('receiver_lines', 'Button: ' + val);
    }
    if (command == 'P') {
      dispatchPotentiometer(val);
    }
  }

  function commandSender(data) {
    if (serial.is_connected == 1) {
      talkApp.sendCommand(data);
    }
  }

  function dispatchButton(val, btn_state) {
    if (btn_state == 'pressed') {
      document.dispatchEvent(
        new CustomEvent('buttonPressed', {
          detail: { button: val },
        })
      );
    }
    if (btn_state == 'released') {
      document.dispatchEvent(
        new CustomEvent('buttonReleased', {
          detail: { button: val },
        })
      );
    }
    talkFancylogger.logButton(val + ' ' + btn_state);
  }

  function dispatchPotentiometer(val) {
    // appendLine('receiver_lines', 'Potentiometer:' + val);
    document.dispatchEvent(
      new CustomEvent('potentimeterChange', {
        detail: { potentiometer: val },
      })
    );
    //console.log('%cIN: Potentiometer: ' + val, baseConsoleStylesIN);
  }

  function changeLedColor(led_index, led_color, led_effect = 0) {
    talkFancylogger.logLed(led_index, led_color, led_effect);
    const led_color_code = colorLeds[led_color];
    commandSender('L' + led_index + led_color_code + led_effect);
  }

  function changeAllLedsColor(led_color, led_effect = 0) {
    // send first a command to avoid missign packet
    commandSender('L0000');
    for (let i = 0; i < 10; i++) {
      talkFancylogger.logLed(i, led_color, led_effect);
      const led_color_code = colorLeds[led_color];
      talkCommands.commandSend('L' + i + led_color_code + led_effect);
    }
  }

  function allLedsOff() {
    talkFancylogger.logLed('all', 'black', 0);
    commandSender('Lx000');
  }
  /* PUBLIC MEMBERS */
  return {
    commandInterpret: commandInterpretter,
    commandSend: commandSender,
    ledColor: changeLedColor,
    ledAllColor: changeAllLedsColor,
    pressButton: dispatchButton,
    turnPotentiometer: dispatchPotentiometer,
    ledAllOff: allLedsOff,
  };
})();
