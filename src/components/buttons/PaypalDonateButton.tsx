import * as React from 'react'

export const PaypalDonateButton: React.FC = () => {
  return (
    <form action="https://www.paypal.com/donate" method="post" target="_top">
      <input type="hidden" name="hosted_button_id" value="BNAGL4D89LJDE" />
      <input
        type="image"
        src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
        name="submit"
        title="PayPal - The safer, easier way to pay online!"
        alt="Donate with PayPal button"
      />
      <img
        alt=""
        src="https://www.paypal.com/en_IT/i/scr/pixel.gif"
        width="1"
        height="1"
      />
    </form>
  )
}
