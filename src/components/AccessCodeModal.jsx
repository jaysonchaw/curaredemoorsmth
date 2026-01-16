import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ButtonTemplate from './ButtonTemplate'
import { verifyAdminCode, setAdminAuthenticated } from '../utils/adminAuth'

const AccessCodeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [accessCode, setAccessCode] = useState('')
  const [uli, setUli] = useState('')
  const [showUliInput, setShowUliInput] = useState(false)
  const [error, setError] = useState('')

  // Group to Access Code mapping
  const groupAccessCodes = {
    1: 'SIw}M5d7',
    2: '<3&37Lv&',
    3: 'q%0J]0f]',
    4: 's>2YWc!a',
    5: 'Nw!+P8*I',
    6: 'o>rH2,ay',
    7: '98A$s*Tc',
    8: 'Hl27i!&A',
    9: 'GefZE8/V',
    10: 't}?c8M?X',
    11: '5m},O.Dd',
    12: 'R.7bM!CT',
    13: 'T&6IPf8b',
    14: '8usY/-gT',
    15: 'W)4<yLT#',
    16: '7+wB%6Q71',
    17: 'U1>R$u2G',
    18: 'rR1((^DH',
    19: '88b>FW16',
    20: '#Unh9@SI'
  }

  // Group to ULIs mapping
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
  }

  // Get array of valid access codes
  const validAccessCodes = Object.values(groupAccessCodes)
  
  // Helper function to get group number from access code
  const getGroupFromCode = (code) => {
    return Object.keys(groupAccessCodes).find(
      group => groupAccessCodes[group] === code
    )
  }

  // Helper function to check if ULI belongs to a group
  const isULIValidForGroup = (uliValue, groupNumber) => {
    const groupULIList = groupULIs[groupNumber] || []
    return groupULIList.includes(uliValue)
  }

  const handleAccessCodeChange = (e) => {
    const value = e.target.value
    setAccessCode(value)
    setError('')
    
    // Check for secret admin code
    const isAdminCode = verifyAdminCode(value)
    if (isAdminCode) {
      setShowUliInput(false)
      return
    }
    
    // Special admin access code
    if (value === 'devsecure') {
      setShowUliInput(false)
    } else if (value === 'testsecure') {
      setShowUliInput(false)
    } else if (value === 'testsecurev2') {
      setShowUliInput(false)
    } else if (validAccessCodes.includes(value)) {
      setShowUliInput(true)
    } else if (showUliInput) {
      setShowUliInput(false)
      setUli('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check for secret admin code
    const isAdminCode = verifyAdminCode(accessCode)
    if (isAdminCode) {
      console.log('[AccessCodeModal] Admin code verified, redirecting to /admin')
      setAdminAuthenticated()
      onClose()
      navigate('/admin', { replace: true })
      setAccessCode('')
      setUli('')
      setShowUliInput(false)
      setError('')
      return
    }
    
    // Special admin access code
    if (accessCode === 'devsecure') {
      // Redirect to admin dashboard
      onClose()
      navigate('/admin/dashboard')
      setAccessCode('')
      setUli('')
      setShowUliInput(false)
      setError('')
      return
    }
    
    // Special developer test mode
    if (accessCode === 'testsecure') {
      // Create temporary test user session
      const testUser = {
        id: 'test-dev-' + Date.now(),
        email: 'developer@test.curare',
        user_metadata: {
          full_name: 'Developer Tester'
        }
      }
      
      const testUserData = {
        id: testUser.id,
        email: testUser.email,
        full_name: 'Developer Tester',
        selected_path: 'Pre-Med',
        daily_time_minutes: 30,
        xp: 0,
        level: 1,
        has_completed_intro: false, // Always go through intro since data is wiped
        uli: 'TEST-DEV',
        group_number: 0,
        birthday: '2000-01-01',
        parent_consent: true,
        is_test_mode: true
      }
      
      // Store in sessionStorage (clears on browser close)
      sessionStorage.setItem('test_user', JSON.stringify(testUser))
      sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
      sessionStorage.setItem('is_test_mode', 'true')
      
      onClose()
      navigate('/introduction') // Go to intro instead of dashboard
      
      // Reset form
      setAccessCode('')
      setUli('')
      setShowUliInput(false)
      setError('')
      return
    }
    
    // Special testsecurev2 access code
    if (accessCode === 'testsecurev2') {
      onClose()
      navigate('/')
      
      // Reset form
      setAccessCode('')
      setUli('')
      setShowUliInput(false)
      setError('')
      return
    }
    
    if (!showUliInput) {
      setError('Please enter a valid access code')
      return
    }
    
    if (!uli.trim()) {
      setError('Please enter your ULI (Unique Learner Identifier)')
      return
    }
    
    // Get the group number for this access code
    const groupNumber = getGroupFromCode(accessCode)
    
    // Validate that the ULI belongs to the group associated with the access code
    if (!isULIValidForGroup(uli.trim(), groupNumber)) {
      setError('This ULI does not match the access code group. Please enter a valid ULI for this group.')
      return
    }
    
    // Check if group and ULI are activated
    try {
      const response = await fetch(`http://localhost:3001/api/validate-access?accessCode=${encodeURIComponent(accessCode)}&uli=${encodeURIComponent(uli.trim())}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Access code or ULI is not activated yet')
        return
      }
      
      if (!data.valid) {
        setError('This access code and ULI combination is not activated yet. Please contact your administrator.')
        return
      }
    } catch (err) {
      setError('Unable to verify activation status. Please try again.')
      return
    }
    
    // Redirect to signup with access code and ULI
    onClose()
    navigate(`/signup?accessCode=${encodeURIComponent(accessCode)}&uli=${encodeURIComponent(uli.trim())}&group=${groupNumber}`)
    
    // Reset form
    setAccessCode('')
    setUli('')
    setShowUliInput(false)
    setError('')
  }

  const handleClose = () => {
    // Reset form when closing
    setAccessCode('')
    setUli('')
    setShowUliInput(false)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        
        <h2 className="text-2xl font-semibold text-black mb-2">Enter Access Code</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Some users, testers, and groups have been given Early Access for experimental purposes.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={accessCode}
              onChange={handleAccessCodeChange}
              placeholder="Enter access code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
            />
          </div>

          {accessCode === 'devsecure' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Admin Access:</strong> You will be redirected to the admin dashboard to manage group activations.
              </p>
            </div>
          )}
          {accessCode === 'testsecure' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Developer Test Mode:</strong> This will create a temporary session that doesn't save to the database. All data will be cleared when you log out.
              </p>
            </div>
          )}
          {accessCode === 'testsecurev2' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800">
                <strong>Test Secure V2:</strong> Access the new question type testing interface.
              </p>
            </div>
          )}
          {verifyAdminCode(accessCode) && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-800">
                <strong>Admin Access:</strong> You will be redirected to the admin analytics dashboard.
              </p>
            </div>
          )}
          
          {showUliInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your ULI (Unique Learner Identifier)
              </label>
              <input
                type="text"
                value={uli}
                onChange={(e) => {
                  setUli(e.target.value)
                  setError('')
                }}
                placeholder="Enter your ULI"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          
          <ButtonTemplate
            variant="button2"
            text="Submit"
            textColor="#2563ebff"
            type="submit"
            className="w-full"
            style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
          />
        </form>
      </div>
    </div>
  )
}

export default AccessCodeModal

