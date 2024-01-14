import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { IconButton } from "../../mui/index.js";

const DonateButton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <form
      className={className}
      action="https://www.paypal.com/donate"
      method="post"
      target="_blank"
      style={{ display: "flex", flex: "0 0 auto" }}
    >
      <input type="hidden" name="hosted_button_id" value="BNAGL4D89LJDE" />
      <input type="hidden" name="no_recurring" value="0" />
      <input type="hidden" name="item_name" value="Support for lies.exposed" />
      <input type="hidden" name="item_number" value="lies.exposed support" />
      <input type="hidden" name="amount" value="5.00" />
      <IconButton
        type="submit"
        disableFocusRipple={true}
        disableRipple={true}
        focusRipple={false}
        style={{ padding: 0, marginRight: 10, fontSize: undefined }}
        size="large"
      >
        <FontAwesomeIcon
          icon={"circle-dollar-to-slot"}
          style={{ color: "white", width: 20, height: 20 }}
        />
      </IconButton>
    </form>
  );
};

export default DonateButton;
