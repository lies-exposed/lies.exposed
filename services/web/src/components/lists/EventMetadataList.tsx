import { Events } from "@econnessione/shared/lib/io/http";
import {
  faHouseDamage,
  faMoneyBillWave,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { themedUseStyletron } from "@theme/CustomeTheme";
import { Block } from "baseui/block";
import * as React from "react";

export interface EventMetadataListProps {
  metadata: Events.Event[];
}

export const EventMetadataList: React.FC<EventMetadataListProps> = (props) => {
  const [, $theme] = themedUseStyletron();
  const protestIcon = (
    <FontAwesomeIcon icon={faUserShield} color={$theme.colors.positive} />
  );
  const protests = props.metadata.filter(
    (m) => m.type === Events.Protest.PROTEST.value
  ).length;

  const fundIcon = <FontAwesomeIcon icon={faMoneyBillWave} />;
  const funds = props.metadata.filter((m) => m.type === "ProjectTransaction")
    .length;

  const impactIcon = (
    <FontAwesomeIcon icon={faHouseDamage} color={$theme.colors.negative} />
  );
  const impacts = props.metadata.filter((m) => m.type === "ProjectImpact")
    .length;

  return (
    <Block>
      <div>
        Proteste {protestIcon} {protests}
      </div>
      <div>
        Fondi {fundIcon} {funds}
      </div>
      <div>
        Impatti {impactIcon} {impacts}
      </div>
    </Block>
  );
};
