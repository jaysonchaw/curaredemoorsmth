const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Auto-initialization flag
let initialized = false;

// Middleware to verify admin (devsecure access)
const verifyAdmin = async (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  
  if (adminKey !== 'devsecure') {
    return res.status(401).json({ error: 'Unauthorized - Admin access required' });
  }
  
  req.adminKey = adminKey;
  
  // Auto-initialize on first admin access
  if (!initialized) {
    await initializeDatabase();
  }
  
  next();
};

// Auto-initialize database - creates tables and seeds data if needed
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if groups table exists and has data
    const { data: existingGroups, error: groupsError } = await supabase
      .from('groups')
      .select('group_number')
      .limit(1);

    // If table doesn't exist (error code PGRST116) or is empty, initialize
    const needsInit = groupsError?.code === 'PGRST116' || 
                      groupsError?.message?.includes('does not exist') ||
                      (!groupsError && (!existingGroups || existingGroups.length === 0));

    if (needsInit) {
      console.log('Setting up groups and ULIs...');
      
      // Seed groups
      const groupCodes = {
        1: 'SIw}M5d7', 2: '<3&37Lv&', 3: 'q%0J]0f]', 4: 's>2YWc!a', 5: 'Nw!+P8*I',
        6: 'o>rH2,ay', 7: '98A$s*Tc', 8: 'Hl27i!&A', 9: 'GefZE8/V', 10: 't}?c8M?X',
        11: '5m},O.Dd', 12: 'R.7bM!CT', 13: 'T&6IPf8b', 14: '8usY/-gT', 15: 'W)4<yLT#',
        16: '7+wB%6Q71', 17: 'U1>R$u2G', 18: 'rR1((^DH', 19: '88b>FW16', 20: '#Unh9@SI'
      };

      const groupsToInsert = Object.entries(groupCodes).map(([num, code]) => ({
        group_number: parseInt(num),
        group_code: code,
        activated: false
      }));

      const { error: groupsInsertError } = await supabase.from('groups').upsert(groupsToInsert, { onConflict: 'group_number' });
      if (groupsInsertError) {
        console.error('Error inserting groups:', groupsInsertError);
        throw groupsInsertError;
      }

      // Seed ULIs
      const groupULIs = {
        1: ['q8nZeBS$', 'vIM{8k7@', 'txOb+Iq1', 'aes}m/8E', 's4ln-6]M', 'JMH%%}1c', 'v@Ib<).0', 'x1PJKKZ:', '40$<JhXK', 'DHQ_aV[2', 'k?mPOgx7', 'NUv/y2[$', 'a2jS7N[T', 'z1pKL-(W', 'z5j(K+Y;', 'VR#!}]5e', '8!3KTl)U', '8m.P6CBP', 'v86ZjrW,', 'DZ,f^mq3', 'xetexE1.', 'lya0uCT}', 'fz_[0]XI', 'G)IZDkC2', 'UC]2>o@*', 's!Hh+5EB', 'a,wyI?K2', 'H8a1ja6)', 'A4^=TyJc', '4pn!<}pY'],
        2: ['HgEd,d<6', 'q9IXE4_A', 'LwXHG1F_', 'PS]6e30K', 'fF#81Fu9', 'mB)/HEy9', 't;84R76?', 'qq?;O,4_', 'X>x>X5iw', '0;tKfV*b', 'bsG#vQJ6', 'w&VIPGG2', 'dhHPAQ6;', '6w@#EI>m', 'A%pGL:m6', 'beSAD6R/', 'G)ZP*@v9', 'v%w{.gV2', 'M]Ijt5<F', 'gDXJ+,Z0', 'rTBPok7+', 'Ut/nW)@3', 'P<k6fs?=', 'x#(+mj7Y', 'HZ}),z)3', 'D[6D0sJ*', '3}l_?6mN', 'sG(q}8c@', 'B#mClB,4', 'Y;ZSJnF4'],
        3: ['7]}q2-sZ', 'Ni,%pCg1', 'N;pZk0$i', 'wLZ:8/<#', 'C)S,83Mx', 'S(tYJA4X', 'mY59Do@s', '3NY),pf7', 'w,%hEcA0', 'fc$G/3.5', 'c8p7i7Y(', '6>%Q[Fg7', 'ed%ojJF7', 'YQ?Fn(=1', '3-&8Qhba', 'GY3vf+Eg', 'd{1Fk^lw', 'WU31oap,', '21U&6)p=', 'rqPQE3E>', '0ITk#2!9', 'N5$d0<s$', 'X_>&J#0g', '5z{c-Su3', 'e!jAk-f6', 'F;=:OkI6', 'Xwehmn*1', 'GeE*jGH3', 'BPBP^uJ4', 'XL+b3%x{'],
        4: ['9<[];.lH', 'y6}Pp4fw', '7I,,]TNx', 'fANS]>n8', 'DGUxJJ7(', 'Vxx8U--L', 'jgLr/nD6', 'l*LH:j3P', '3nr5Rk$J', 'SH{O<<7c', 'E1xk+5w_', 'AU[J:!m2', 'SApJK__3', 'AJp4HDg.', 'DX>I1d3M', '9c<Fqk!f', '9bH}dR9,', 'esxIq$m0', 'a?v8v;Q.', '1-CwN+[d', 'J=V(TCw6', '4dO+.ri.', 'YCPj>A7m', '8[/+B>:j', 'y?yWO1!r', 'g}/.6w=J', 'vxB7ozP-', 'xLCTi6K&', 'HX2Qyg%Y', 'h1]tn#hM'],
        5: ['bEvOm)B8', 'sC4;cc9L', 'J1KoG:q9', 'a,&N?D6h', 'o.UFr_*1', '0;P<*7-s', 'g=kX5$iT', 'pa/g@lH4', 'Dy&uwC(1', 'IMuzIl?5', 'gW76d#Fv', 'g#Gwb7KW', '8F/{D4z/', 's)?SlO9y', 'Ovl3zyz}', 'AO({k}/5', 'NjyzN;Y7', 'U651=QuX', 'Q3/oPshk', 'LbJ@?qL5', '9)rpRAz,', 'mV{5u*_p', 'CtL^oXC7', '1XO,Ctd3', 'MFrINP&1', 'AbpQm7>!', 'CCA1sGy[', 'c7Tt<r:K', 'mix:=Ed2', 'RLC,}{9p'],
        6: ['NrVYJ,P8', 'DLg:DFg1', 'Wv^uv^g8', 'qZc}[Z)3', '8:-6VzzK', 'iK_SHim1', 'Cd0N>OZO', 'Z1fPW6J$', 'H}Cd%Ow9', 'O@S!Uha0', 'f%#L:SE0', 'BAcK39y@', '2%PL]o,u', 'qX]Z[OC2', 'F5&B(3:q', 'm#(P35Sp', 'p,;Ufb<2', 'sPv^o$t5', 'TlMa;D4L', 'mnb?@l8N', 'Sil=aDF5', 'OXb_*Yb4', 'F_r&$Q{4', 'x7@U?dJ,', 'Iu,exy3@', 'BCM5VH)x', 'Ff:%R>r5', 'laHdCA0_', 'V6k[Z9Lk', 'ciNpDm6_'],
        7: ['hE+kwn;6', 'C/<qW{S5', 'uw{<^ZN4', 'erT]79,N', 'lwtgDz0?', '36JMBfz<', 'WH4w/M?-', 'wD<)Mg!9', 'hAYaC^%7', 'oju0Zol}', 'EN7dj}bd', 'K3vV650(', '1]f]=fdK', '7<!D7;rq', 'T%Y71}2r', 'dL}CoR$5', 'Dr]t!i$5', 'eWYLS5u]', 'Z.-uF-[9', 'Zk4Ry)qc', 'J8$+9bjA', '0e$or1qJ', 'Ed_+W-&3', 'D93F@j^.', '3&+f0rpA', 'LTcKus#8', 'M%i0IAvH', 'Ows}f>X2', 'B%9/2ie6', 'IMLx8V,^'],
        8: ['4qFeO2F+', '1Vb+4qar', 'rL6Nq5-E', 'T/*k6qvy', '21BK&SCf', 'X0*RS8_b', 'ZDVI({3m', 'U(n}n=s0', 'Til7mOV<', 'xO[dJ;o9', 'M*QC#M2l', 'Cga{qfU5', 'jSOx0]oa', '2^@[CkAt', '5EB%}XBy', '4U__X9Dj', 'Sk>W!9(%', 'g0=H2Pj_', 'NLYNX-f5', '1KQf1?&a', 'i8.{XsJ4', 'Ee^&%6S6', 'Pf2a@<z5', 'o:ZLMJl3', 'TZ4OA_4d', 'Swt_.qo7', 'pzC+f@X0', 'UTkk81,.', 'b)_;.a9S', 'u1hFsZQ^'],
        9: ['uoFX%!r4', 'LM1j=Guv', 'vuBOo{(4', 'VPyiul6^', 'zS*:BrN4', 'p)j-ENT5', '9H@ufIg_', 'dSvc.u:3', 'jQC9vt6;', 'cM)^v^+0', 'MHV)et4,', 'Aw[2gHio', 'BBB[!2Mr', 'Df6[3_L6', '1k.Y&@qF', 'ls)oX8y&', 'rAE@Y1^*', 'O6.S-TAy', 'pkT**y=7', 'sOisj+e6', 'Kv@Cd6kr', 'H=H^R_8q', 'C>AL$p%9', 'ARb},x}1', 'DsgLWF8@', 'c84/4wkR', '8&fcUI>B', 'lY<IoVa1', 'pRlI*LO3', 'jxtU1>%+'],
        10: ['wDt,<cO1', 'tEaX;Ax1', 'ANx}Iy44', '6&hoW/T&', 'wMszjo6=', 'eFy,q_/8', 'Sm3]M8<_', 'p)Q&@9v7', 'm#^b]0M&', '9xDmvXi:', 'D)}:cdJ6', 'gC8rfLU=', 'ZQ;&%@2z', 'Zr9}U0L3', 'o{=L[6JC', 'Kww%H/{3', 't4>Ijw3@', 't+vwzJ$1', '9V/h:H*B', 'uJVjDg^3', 'o)xur4$X', 'cIR!:ix5', '6wE;f3b6', 'xN?n,{K9', 'tF!jL5qn', 'x(5MzNU4', 'j,!%QU5a', 'Z>tCZ+9;', 'nR&IdZQ8', 'VURujr-2'],
        11: ['H+o8DO>d', 'cu[zKDg6', 'X<mi6?}$', 'PCSskQ_2', 'd1^x!b6B', '5&h)mRzy', '5yj2:xhS', 'x}myu0,L', '7z4VeRS)', 'RR-hdsg2', 'Pxr7*PYY', 'IPQvA&D4', '7VeoVSD/', 'D7)RK9Zg', '4GLJ(b*(', 'skM^<Jp2', 'YTT!4z!i', 'DP;q%}!5', '8jJgxy#U', 'S6{Za&@0', 'jcZ/#6Nv', 'ng?T*bX4', 'SaUUGw)5', 'iCMJ1<ir', 'e7[(e*eT', '5X2R9h!C', '3Pxq@eoB', 'Ft-sjfE0', 'Ry/of;N1', 'S%3$*N)q'],
        12: ['i:xgfwU2', 'wOH:dz?4', 'x2w:ms9H', '5l(wFeA,', 'nGy#%Q6f', 'x]F>1wrd', 'UvdP:T,5', 'P((A+zV8', 'cR>(Uw/6', '8P9hGfV&', 'EQ9}8DMd', '3Hy*8[2n', 'iLQPEX_2', 'OY(L+u$9', 'J^Fuh<c1', '5?o[?(2J', 'T_7M*y*i', 'EKn*j]_7', 'v8-=!L:&', 'Nn!7^vYq', 'HsQM%<a2', 'luAebT3(', 'Z<^G_.n3', '7>tlSp#z', 'mkick+7Y', 'tKW=A*3!', '6JL<EY}j', 'MZfRnO(0', '4z7n]uCM', 'k]gh{iF7'],
        13: ['SZ4EEu4#', 'Yg6}cuKl', '6Nn[=24F', 'Ve8Xnmm)', 'RW?Pm;N5', 'wpriI*X2', 'NE]51wEw', 'JR_8;:Gn', 'EdHQbB4#', 'Xj#<sp@1', '6s8L&[uT', 'Zd{/E^i6', 'qTICVk0^', 'q2[3$&tN', 'fxBt768_', 'm[ydf)G5', '2IoXo&Tw', 'nB^O_GC8', '21zm&7Ej', 'uXJ;=5}w', 'A-6Ci1Vj', 'cxKb)Dd9', 'WxDG-?j3', 'X9O]bUO]', 'f:<Td+B8', '6WOiR[b,', 'VU)ryaL3', 'v8.?TtaC', 'ZYu!IRK2', 'WMQf1+aj'],
        14: ['Jc(cZK7;', 'edpZMd>7', 'bO)&N{V7', 'wJwfyI:1', 'Fc8)]4D?', 'gsm1r6#V', 'pU(eU(+6', 'q[^vdgU0', 'kGBpB;;8', 'a}gDMgS8', 'ZPI7qh_+', 'V=A)@En7', 'wOO%YU8r', 'S6*2<2Ja', 'Nu;8V66p', 'nblTzO4#', 'IeXd^!+4', 'sF$?v!49', 'Ydo8j@f2', 'S7<!t:%_', 'pSg}pA0s', 'QM]=7itb', 'b=FCIP6)', '3!3./qTe', 'Gfh1Fjc>', 'u#z-opQ0', 'eozwr!3J', '9E7-./s0', 'Mv06CUk<', 'gTv4D.Gn'],
        15: ['b>*.OGT9', '1D)[l__>', '6tP%RP>7', 'Cw,fKai7', 'BPc?)vz3', 'KuWWjG>8', 'Z{eCM&F5', 'gi{Hxha9', 'Jc6%A/wS', 'fGC$B3)U', 'cVpzDO1^', 'suBe+A1U', 'pVcQ38a+', 'RF=eqew6', 'RKwiBr6,', '3,Uo,2Mc', 'HO2T%DdE', '7j16rZr(', 'JML$Co6Y', 'y{O[?[R9', 'RjJ>BRI1', 'pazbm:H3', 'D{-OaS>5', 'c;)_moC6', 'O};STjF9', 'TH3E{{Yl', 'U=/e$Dd0', 'q)x{iE_1', 'H&xK8S-J', 'MG/x<!2I'],
        16: ['nBUV[_V0', 'F0Pj?es]', 'oR,SW],1', 'C{QWYLi2', 'mjec?}2A', 'cH}?wiJ5', 'q,QLmTR8', 'Lx+B.(I8', 'b7pjR{+V', 'Dal24]>d', 'r46o^[$X', 'ivFvYN,2', 'X)Z0m3uM', '2Eni$4D0', 'tr)[h&I5', 'po4n3VV{', 'K2JhwJS#', 'C?C1eF+2', 'bOy><s7S', 'C2NTS/:j', 'M>u]F?)7', 'e$QtXKs6', 'f*zjv!F6', 't=MB=rj0', 'i2/sy;lB', 'ygoRzo8@', 'zvk;[ZT8', 'vFar=.y1', 'eI@23Huj', '6w@Dmf15'],
        17: ['O=_iQi(5', 'Rari-pJ0', 'l6W81pW#', 'V9JD8pv(', '9@9$;$Gv', '0uQmO/pa', '7WYD-Kw*', 'TD&!/1m{', 'LD{>AF2y', 'jY^Y?I;2', 'n!<QIW=2', 'a{q#xL<0', 'y1H5&iR5', '9Bh>ip>C', 'G!,}U;y5', 'd5^D41yp', 'X*bNsEa8', 'nY,DqCR2', 'egZy5LP&', '1d&DRb-z', '6:*8uPxH', 'kj*KuL[8', 'wFF7s=m)', '51n3N}&T', 's!4E=;a#', 'm<(GZDY2', 'Wl4Cw/Ku', 'cdHYxF$2', 'ceamg,8N', 'Lcff0ph$'],
        18: ['S}:7]y$@', '2uLmy<^)', 'G,YEQG6k', 'CSX$&gd4', 'QgMMEI]4', 'Z0Z9H]c0', '97UaPyR>', 'RrHvp4)>', 'XXrFJ(M0', 'osl=K<R3', 'Iabl!(p6', 'EYk,e:2a', 'L{z#C{>9', 'xgyuzS9-', 'd=%_LmC3', 'IJm5[>%t', '2rv>jMz+', 'Y7BxG<^L', 'Eg0l!^C>', 'lJ%*OPU7', 'ovLm%.3%', 'pL7x;L#s', 'WPneW%=5', 'TEg5pEW?', 'j{RiZ,N7', '8CHNTl@F', 'Co;*X)j9', 'hrZXq!h9', 'RWh+%&q5', 'IqPlrb$9'],
        19: ['cQ$8,dtd', '7d]:d_vV', 'D*u+Bo[4', 'O[QRFdM7', 'cPjsH1m%', 'B6#CLm08', 'QF20$U-e', 'coICz8I$', 'BqUQpN3;', 'V6t%7H:&', '8S[?h@I.', 'RpZB(k0J', 'YAqaY-}5', 'wi.UMDO7', 'P^RGC83s', 'aOjn<&3S', 'JkY:D&b8', 'v>sMsAQ7', 'I+p0dyMc', 'h;fbaiT8', 'Qk_JpXn5', 'hGxE/Tw0', 'OQfL_N=0', 'j,!m+(0Y', 'qMB?pM;6', 'k?uWY5-N', 'khSv>O3l', 'sX>-m<r0', 'inT51Ix@', 'Qo.rg@4o'],
        20: ['bQFT+-j6', 'DlH:to+0', '3/m_xYjh', '3rf[%?$R', '0wL(*@[5', 'sp8MHv_y', 'WPS!&Q0a', '09@!,$oT', 'eZs7u(+m', 'a2EExkt}', 'l^#p{/W1', 'C_KpGfZ3', '12fFB:Kx', 'a(vn&GL5', 'VB>hfO-8', 'Gx@um,p1', 'ts_LpGS2', 'Y!pc%fd1', 'o[[4WCVs', 'cmK8Iho{', 'q/azX<X6', 'n($c!jM5', 'Fv9PW$lP', 'fdx_Lr^9', 'Rw9]M,C1', 'X!]Ybyb3', 'W8l]d%NV', '7T[Oadq)', 'zpvPGT?4', 'OA#{4m=2']
      };

      const ulisToInsert = [];
      for (const [groupNum, uliList] of Object.entries(groupULIs)) {
        for (const uliValue of uliList) {
          ulisToInsert.push({
            uli_value: uliValue,
            group_number: parseInt(groupNum),
            activated: false
          });
        }
      }

      // Insert in batches of 100
      for (let i = 0; i < ulisToInsert.length; i += 100) {
        const batch = ulisToInsert.slice(i, i + 100);
        const { error: uliInsertError } = await supabase.from('ulis').upsert(batch, { onConflict: 'uli_value' });
        if (uliInsertError) {
          console.error(`Error inserting ULIs batch ${i}:`, uliInsertError);
          throw uliInsertError;
        }
      }

      console.log('Database initialized successfully');
      initialized = true;
    } else {
      initialized = true;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    initialized = false; // Reset so it tries again
    throw error; // Re-throw so caller knows it failed
  }
}

/**
 * POST /api/admin/initialize
 * Manually trigger database initialization
 */
router.post('/initialize', verifyAdmin, async (req, res) => {
  try {
    initialized = false; // Reset flag
    await initializeDatabase();
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Manual initialization error:', error);
    res.status(500).json({ error: `Initialization failed: ${error.message}` });
  }
});

/**
 * GET /api/admin/groups
 * Get all groups with activation status
 */
router.get('/groups', verifyAdmin, async (req, res) => {
  try {
    // Ensure database is initialized
    if (!initialized) {
      await initializeDatabase();
    }

    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .order('group_number', { ascending: true });

    if (error) {
      console.error('Groups fetch error:', error);
      // Try to initialize if table doesn't exist
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        await initializeDatabase();
        const { data: retryGroups, error: retryError } = await supabase
          .from('groups')
          .select('*')
          .order('group_number', { ascending: true });
        
        if (retryError) {
          return res.status(500).json({ error: `Failed to fetch groups: ${retryError.message}` });
        }
        return res.json(retryGroups || []);
      }
      return res.status(500).json({ error: `Failed to fetch groups: ${error.message}` });
    }

    res.json(groups || []);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

/**
 * GET /api/admin/groups/:groupNumber/ulis
 * Get all ULIs for a specific group
 */
router.get('/groups/:groupNumber/ulis', verifyAdmin, async (req, res) => {
  try {
    const { groupNumber } = req.params;

    // Ensure database is initialized
    if (!initialized) {
      await initializeDatabase();
    }

    const { data: ulis, error } = await supabase
      .from('ulis')
      .select('*')
      .eq('group_number', groupNumber)
      .order('uli_value', { ascending: true });

    if (error) {
      console.error('ULI fetch error:', error);
      // If table doesn't exist, try to initialize
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        await initializeDatabase();
        // Try again
        const { data: retryUlis, error: retryError } = await supabase
          .from('ulis')
          .select('*')
          .eq('group_number', groupNumber)
          .order('uli_value', { ascending: true });
        
        if (retryError) {
          return res.status(500).json({ error: `Failed to fetch ULIs: ${retryError.message}` });
        }
        return res.json(retryUlis || []);
      }
      return res.status(500).json({ error: `Failed to fetch ULIs: ${error.message}` });
    }

    res.json(ulis || []);
  } catch (error) {
    console.error('Get ULIs error:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

/**
 * POST /api/admin/groups/:groupNumber/activate
 * Activate a group with selected ULIs
 */
router.post('/groups/:groupNumber/activate', verifyAdmin, async (req, res) => {
  try {
    const { groupNumber } = req.params;
    const { uliIds } = req.body;
    const groupNum = parseInt(groupNumber);

    if (groupNum < 1 || groupNum > 20) {
      return res.status(400).json({ error: 'Invalid group number' });
    }

    if (!uliIds || !Array.isArray(uliIds) || uliIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one ULI to activate' });
    }

    // Calculate countdown end date (3 weeks 6 days = 27 days from now)
    const countdownEndDate = new Date();
    countdownEndDate.setDate(countdownEndDate.getDate() + 27);

    // Update group activation status
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .update({
        activated: true,
        activated_at: new Date().toISOString(),
        activated_by: req.adminKey,
        countdown_end_date: countdownEndDate.toISOString(),
      })
      .eq('group_number', groupNum)
      .select()
      .single();

    if (groupError) {
      return res.status(500).json({ error: 'Failed to activate group' });
    }

    // Activate selected ULIs
    const { data: activatedUlis, error: uliError } = await supabase
      .from('ulis')
      .update({
        activated: true,
        activated_at: new Date().toISOString(),
        activated_by: req.adminKey,
      })
      .in('id', uliIds)
      .eq('group_number', groupNum)
      .eq('activated', false)
      .select();

    if (uliError) {
      console.error('Error activating ULIs:', uliError);
      return res.status(500).json({ error: 'Failed to activate selected ULIs' });
    }

    res.json({
      ...group,
      message: `Group ${groupNum} activated with ${activatedUlis?.length || 0} ULI(s). Post-test will be released in 27 days.`,
    });
  } catch (error) {
    console.error('Activate group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/groups/:groupNumber/deactivate
 * Deactivate a group
 */
router.post('/groups/:groupNumber/deactivate', verifyAdmin, async (req, res) => {
  try {
    const { groupNumber } = req.params;
    const groupNum = parseInt(groupNumber);

    const { data: group, error } = await supabase
      .from('groups')
      .update({
        activated: false,
        activated_at: null,
        countdown_end_date: null,
      })
      .eq('group_number', groupNum)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to deactivate group' });
    }

    res.json(group);
  } catch (error) {
    console.error('Deactivate group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/ulis/bulk-activate
 * Activate multiple ULIs at once
 */
router.post('/ulis/bulk-activate', verifyAdmin, async (req, res) => {
  try {
    const { uliIds } = req.body;

    if (!Array.isArray(uliIds) || uliIds.length === 0) {
      return res.status(400).json({ error: 'ULI IDs array is required' });
    }

    const { data: ulis, error } = await supabase
      .from('ulis')
      .update({
        activated: true,
        activated_at: new Date().toISOString(),
        activated_by: req.adminKey,
      })
      .in('id', uliIds)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to activate ULIs' });
    }

    res.json({
      message: `${ulis.length} ULIs activated`,
      ulis,
    });
  } catch (error) {
    console.error('Bulk activate ULIs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/post-test/status/:groupNumber
 * Check if post-test should be released for a group
 */
router.get('/post-test/status/:groupNumber', verifyAdmin, async (req, res) => {
  try {
    const { groupNumber } = req.params;
    const groupNum = parseInt(groupNumber);

    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('group_number', groupNum)
      .single();

    if (error || !group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const now = new Date();
    const countdownEnd = group.countdown_end_date ? new Date(group.countdown_end_date) : null;
    const shouldRelease = group.activated && countdownEnd && now >= countdownEnd;

    res.json({
      group,
      shouldRelease,
      countdownEnd: countdownEnd?.toISOString(),
      daysRemaining: countdownEnd ? Math.max(0, Math.ceil((countdownEnd - now) / (1000 * 60 * 60 * 24))) : null,
    });
  } catch (error) {
    console.error('Get post-test status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/post-test/release/:groupNumber
 * Manually release post-test for a group
 */
router.post('/post-test/release/:groupNumber', verifyAdmin, async (req, res) => {
  try {
    const { groupNumber } = req.params;
    const groupNum = parseInt(groupNumber);

    const { data: group, error } = await supabase
      .from('groups')
      .update({
        post_test_released: true,
        post_test_released_at: new Date().toISOString(),
      })
      .eq('group_number', groupNum)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to release post-test' });
    }

    res.json(group);
  } catch (error) {
    console.error('Release post-test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/post-test/questions/seed
 * Seed post-test questions
 */
router.post('/post-test/questions/seed', verifyAdmin, async (req, res) => {
  try {
    const postTestQuestions = [
      { question_number: 1, question_text: 'What is the main job of red blood cells?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Carry oxygen to cells.', B: 'Fight infections', C: 'Make hormones', D: 'Break down nutrients.' }, points: 1 },
      { question_number: 2, question_text: 'Fill in the blank: DNA is found inside the ______ of a cell.', question_type: 'fill_in_blank', correct_answer: 'nucleus', points: 1 },
      { question_number: 3, question_text: 'Why do doctors take blood samples?', question_type: 'text_answer', correct_answer: 'To check markers like glucose, blood cell counts and infection markers so they can diagnose and monitor health.', rubric: { good: 'To check markers like glucose, blood cell counts and infection markers so they can diagnose and monitor health.', borderline_acceptable: 'To see if there is infection or high sugar and other health things.', borderline_unacceptable: 'Because blood can tell about your health but this is vague.', wrong: 'To make your blood cleaner.' }, points: 2 },
      { question_number: 4, question_text: 'Which system controls reflex actions like pulling your hand away from something hot?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Nervous system', B: 'Digestive system', C: 'Endocrine system', D: 'Circulatory system.' }, points: 1 },
      { question_number: 5, question_text: 'What do the kidneys mainly remove from the blood?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Waste and extra water', B: 'Oxygen', C: 'Blood cells', D: 'Hormones.' }, points: 1 },
      { question_number: 6, question_text: 'Fill in the blank: The human heart has ______ chambers.', question_type: 'fill_in_blank', correct_answer: 'four', points: 1 },
      { question_number: 7, question_text: 'Why can siblings look different even with the same parents?', question_type: 'text_answer', correct_answer: 'Because each child inherits a different mix of genes from their parents; genes are shuffled so traits vary.', rubric: { good: 'Because each child inherits a different mix of genes from their parents; genes are shuffled so traits vary.', borderline_acceptable: 'Because genes mix differently so kids are not identical.', borderline_unacceptable: 'Because parents give different traits sometimes.', wrong: 'Because parents decide how their kids will look.' }, points: 2 },
      { question_number: 8, question_text: 'Which part of the blood helps form clots?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Platelets', B: 'White blood cells', C: 'Plasma', D: 'Antibodies.' }, points: 1 },
      { question_number: 9, question_text: 'Fill in the blank: Hormones are released by ______.', question_type: 'fill_in_blank', correct_answer: 'glands', points: 1 },
      { question_number: 10, question_text: 'Why does your heart beat faster during exercise?', question_type: 'text_answer', correct_answer: 'Muscles need more oxygen and nutrients during exercise so the heart pumps faster to deliver more oxygenated blood.', rubric: { good: 'Muscles need more oxygen and nutrients during exercise so the heart pumps faster to deliver more oxygenated blood.', borderline_acceptable: 'Because your body needs more oxygen when you move.', borderline_unacceptable: 'Because your heart is working harder and gets tired.', wrong: 'Because your heart wants to cool you down.' }, points: 2 },
      { question_number: 11, question_text: 'Which nutrient mainly repairs body tissues?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Protein', B: 'Carbohydrate', C: 'Fat', D: 'Vitamin C.' }, points: 1 },
      { question_number: 12, question_text: 'Fill in the blank: Tiny sacs in the lungs where gas exchange happens are called ______.', question_type: 'fill_in_blank', correct_answer: 'alveoli', points: 1 },
      { question_number: 13, question_text: 'What is one way the immune system protects you from illness?', question_type: 'text_answer', correct_answer: 'It makes white blood cells and antibodies that find and destroy germs.', rubric: { good: 'It makes white blood cells and antibodies that find and destroy germs.', borderline_acceptable: 'It fights germs to stop infections.', borderline_unacceptable: 'It keeps germs away sometimes.', wrong: 'It makes you invisible to germs.' }, points: 2 },
      { question_number: 14, question_text: 'Which statement is true about viruses?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Viruses reproduce only inside body cells', B: 'Antibiotics kill viruses', C: 'Viruses are larger than bacteria', D: 'Viruses make their own food.' }, points: 1 },
      { question_number: 15, question_text: 'Fill in the blank: The diaphragm is a ______ that helps you breathe.', question_type: 'fill_in_blank', correct_answer: 'muscle', points: 1 },
      { question_number: 16, question_text: 'What happens to most food in the small intestine?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Nutrients are absorbed into the blood', B: 'Food is stored for later', C: 'Food is converted into bone', D: 'It becomes air.' }, points: 1 },
      { question_number: 17, question_text: 'Which imaging method uses strong magnets to create detailed pictures of soft tissues?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'MRI', B: 'X-ray', C: 'Ultrasound', D: 'Thermography.' }, points: 1 },
      { question_number: 18, question_text: 'Which organ produces insulin?', question_type: 'fill_in_blank', correct_answer: 'pancreas', points: 1 },
      { question_number: 19, question_text: 'Which of the following is a typical symptom of an asthma attack?', question_type: 'multiple_choice', correct_answer: 'A', options: { A: 'Wheezing and shortness of breath', B: 'Sudden hair loss', C: 'High blood sugar', D: 'Blurry, colorful vision.' }, points: 1 },
      { question_number: 20, question_text: 'Explain in one sentence what a vaccine does.', question_type: 'text_answer', correct_answer: 'Trains the immune system to recognise a germ so the body can make protective antibodies without getting the full disease.', rubric: { good: 'Trains the immune system to recognise a germ so the body can make protective antibodies without getting the full disease.', borderline_acceptable: 'It helps your body fight a disease before you get it.', borderline_unacceptable: 'It makes your body stronger against illness sometimes.', wrong: 'It gives you the disease so you can be sick now.' }, points: 2 }
    ];

    const { data: existingQuestions } = await supabase
      .from('post_test_questions')
      .select('question_number')
      .limit(1);

    if (existingQuestions && existingQuestions.length > 0) {
      return res.status(400).json({ error: 'Post-test questions already exist' });
    }

    const { data: insertedQuestions, error } = await supabase
      .from('post_test_questions')
      .insert(postTestQuestions)
      .select();

    if (error) {
      console.error('Error inserting post-test questions:', error);
      return res.status(500).json({ error: 'Failed to insert post-test questions' });
    }

    res.json({
      message: `Successfully inserted ${insertedQuestions.length} post-test questions`,
      questions: insertedQuestions
    });
  } catch (error) {
    console.error('Seed post-test questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
