/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";

export function Card({ name, url, description }) {
  return (
    <div className="col col--6 margin-bottom--lg">
      <div className={clsx("card")}>
        <div className={clsx("card__image")}></div>
        <div className="card__body">
          <Link to={url}>
            <h3>{name}</h3>
          </Link>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
