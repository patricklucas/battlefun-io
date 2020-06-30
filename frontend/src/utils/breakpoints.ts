import styled from "styled-components";

// Small devices (landscape phones, 576px and up)
export const small = "@media (min-width: 576px)";

// Medium devices (tablets, 768px and up)
export const medium = "@media (min-width: 768px)";

// Large devices (desktops, 992px and up)
export const large = "@media (min-width: 992px)";

// Extra large devices (large desktops, 1200px and up)
export const extraLarge = "@media (min-width: 1200px)";

export const MaxWidthSection = styled.section`
  padding: 0 16px;
  width: 100%;
  margin: 0 auto;

  ${small} {
    max-width: 540px;
  }

  ${medium} {
    max-width: 720px;
  }

  ${large} {
    max-width: 960;
  }

  ${extraLarge} {
    max-width: 1140px;
  }
`;
